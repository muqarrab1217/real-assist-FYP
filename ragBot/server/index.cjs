require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const stripeRoutes = require('./lib/stripeRoutes.cjs');

const app = express();
const PORT = process.env.PORT || 10000;

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client with service role key — for creating users without affecting caller session
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;
const getRequestDbClient = (req) => {
  if (!req?.supabaseToken) return supabase;
  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${req.supabaseToken}` } }
  });
};

// IMPORTANT: Stripe webhook needs raw body BEFORE express.json() parses it
app.use(cors());
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeRoutes);

// Middleware (after webhook route so JSON parsing doesn't interfere)
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Authentication middleware - extract user from JWT token in Authorization header
app.use(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      // Set the auth token for Supabase client to use
      req.supabaseToken = token;

      // Verify token and get user
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = user;
        console.log(`[AUTH] Authenticated user: ${user.id}`);
      } else {
        console.warn('[AUTH] Token verification failed:', error?.message);
      }
    } else {
      console.warn('[AUTH] No Bearer token found in Authorization header');
    }
  } catch (error) {
    console.error('[AUTH] Authentication middleware error:', error);
  }
  next();
});

const isAdminUser = async (userId, dbClient = supabase) => {
  if (!userId || !dbClient) return false;
  const { data, error } = await dbClient
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  if (error || !data) return false;
  return data.role === 'admin';
};

const buildUserPortfolioContext = async (userId, dbClient) => {
  if (!userId || !dbClient) return '';
  try {
    const { data: enrollments } = await dbClient
      .from('project_enrollments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: clientRows } = await dbClient
      .from('clients')
      .select('id, property_id, investment_amount, current_installment, total_installments, status')
      .eq('user_id', userId)
      .limit(10);

    let paymentSummary = null;
    if (clientRows && clientRows.length > 0) {
      const clientIds = clientRows.map(c => c.id);
      const { data: payments } = await dbClient
        .from('payments')
        .select('amount, status')
        .in('client_id', clientIds)
        .limit(500);

      if (payments) {
        const paid = payments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const pending = payments
          .filter(p => p.status === 'pending' || p.status === 'overdue')
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        paymentSummary = { paid, pending, totalRecords: payments.length };
      }
    }

    if ((!enrollments || enrollments.length === 0) && (!clientRows || clientRows.length === 0)) {
      return '';
    }

    return `\n\n=== CUSTOMER PROFILE CONTEXT (AUTHENTICATED USER) ===
Use this for personalized answers about the user's own enrollments, installments and project status.
Project enrollments: ${JSON.stringify(enrollments || [])}
Client records: ${JSON.stringify(clientRows || [])}
Payment summary: ${JSON.stringify(paymentSummary || {})}
Only discuss this private context with this authenticated user.`;
  } catch (e) {
    console.error('[QUERY] Failed to build user portfolio context:', e.message);
    return '';
  }
};

// Configure multer for file uploads
const upload = multer({
  dest: 'ragBot/uploads/',
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit per file
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
  },
});

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  try {
    await fs.mkdir('ragBot/uploads', { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
};

// Initialize Gemini AI
const initializeGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  return new GoogleGenerativeAI(apiKey);
};

let genAI;
try {
  genAI = initializeGemini();
} catch (error) {
  console.error('Error initializing Gemini:', error.message);
}

// Config file path for corpus ID
const CONFIG_FILE = 'ragBot/config/corpus-config.json';

// Ensure config directory exists and load config
const loadConfig = async () => {
  try {
    await fs.mkdir('ragBot/config', { recursive: true });
    try {
      const data = await fs.readFile(CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    } catch {
      // Config doesn't exist yet, return default
      return { corpusId: null, corpusName: null };
    }
  } catch (error) {
    console.error('Error loading config:', error);
    return { corpusId: null, corpusName: null };
  }
};

const saveConfig = async (config) => {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
};

// =========================================
// CONTEXT MANAGEMENT HELPERS
// =========================================

// Token counting: ~4 characters per token (rough estimate)
const countTokens = (text) => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

// Calculate total tokens for messages array
const calculateMessageTokens = (messages) => {
  if (!Array.isArray(messages)) return 0;
  return messages.reduce((total, msg) => total + countTokens(msg.content || ''), 0);
};

// Check if we should trigger summarization (at 80% of 3500 available tokens = 2800)
const shouldSummarize = (totalTokens) => {
  const threshold = 2800; // 80% of 3500 available tokens
  return totalTokens >= threshold;
};

// Generate a short title from first message exchange
const generateChatTitle = async (userMessage, assistantResponse, genAI) => {
  if (!genAI || !userMessage) return 'New Chat';

  try {
    const prompt = `Generate a very short title (4-6 words max, under 40 characters) for a real estate chat that starts with:

User: ${userMessage.substring(0, 150)}
Assistant: ${assistantResponse.substring(0, 150)}

Return ONLY the title, no quotes, no explanation:`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const title = response.text().trim()
      .replace(/^["']/, '')
      .replace(/["']$/, '')
      .substring(0, 50);

    return title || 'New Chat';
  } catch (error) {
    console.error('Title generation error:', error.message);
    // Fallback: use first 40 chars of user message
    return userMessage.substring(0, 40).trim() + (userMessage.length > 40 ? '...' : '');
  }
};

// Summarize a batch of messages
const summarizeMessages = async (messages, genAI) => {
  if (!genAI || !Array.isArray(messages) || messages.length === 0) return null;

  try {
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    const prompt = `Summarize this real estate conversation in 2-3 sentences. Focus on key topics, questions, and important decisions. Keep it professional.

Conversation:
${conversationText}

Summary:`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();

    return summary.length > 500 ? summary.substring(0, 500) + '...' : summary;
  } catch (error) {
    console.error('Summarization error:', error.message);
    return null;
  }
};

// Load context (summaries + recent messages) for a chat
const loadChatContext = async (chatId, supabase) => {
  let summaries = [];
  let recentMessages = [];
  let totalTokens = 0;

  try {
    // Load existing summaries
    const { data: summaryData } = await supabase
      .from('context_summaries')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(3); // Keep last 3 summaries max

    if (summaryData) {
      summaries = summaryData;
      totalTokens += summaryData.reduce((sum, s) => sum + (s.summary_token_count || countTokens(s.summary)), 0);
    }

    // Load recent messages (not yet summarized)
    const { data: messageData } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .eq('is_summarized', false)
      .order('created_at', { ascending: true })
      .limit(20); // Load up to 20 recent messages

    if (messageData) {
      recentMessages = messageData;
      totalTokens += calculateMessageTokens(messageData);
    }
  } catch (error) {
    console.error('Error loading chat context:', error);
  }

  return { summaries, recentMessages, totalTokens };
};

// Build context string from summaries and messages
const buildContextString = (summaries, messages) => {
  let context = '';

  // Add summaries first (historical context)
  if (summaries.length > 0) {
    context += '\n\n=== CONVERSATION HISTORY ===\n';
    for (const summary of summaries) {
      context += `[Earlier discussion summary]: ${summary.summary}\n`;
    }
  }

  // Add recent messages
  if (messages.length > 0) {
    if (summaries.length > 0) {
      context += '\n=== RECENT MESSAGES ===\n';
    } else {
      context += '\n\nPrevious conversation:\n';
    }
    for (const msg of messages) {
      const role = msg.role === 'user' ? 'Customer' : 'Agent';
      context += `${role}: ${msg.content}\n`;
    }
  }

  if (context) {
    context += '\nUse this context to provide coherent and consistent responses.\n';
  }

  return context;
};

// Create or get corpus using Gemini File API
const getOrCreateCorpus = async () => {
  const config = await loadConfig();

  if (config.corpusId) {
    console.log(`Using existing corpus: ${config.corpusId}`);
    return config.corpusId;
  }

  // Create new corpus using Gemini File API
  const corpusName = config.corpusName || `real-estate-corpus-${Date.now()}`;
  console.log(`Creating new corpus: ${corpusName}`);

  try {
    // Note: Gemini File Search uses file-based retrieval
    // We'll create a corpus name that can be referenced
    // In the actual Gemini API, files are uploaded and then referenced by corpus

    const newConfig = {
      corpusId: corpusName,
      corpusName: corpusName,
      createdAt: new Date().toISOString(),
    };

    await saveConfig(newConfig);
    console.log(`Corpus created: ${corpusName}`);
    return corpusName;
  } catch (error) {
    console.error('Error creating corpus:', error);
    throw error;
  }
};

// Upload endpoint - supports both single and multiple files
// Mount Stripe API routes (auth-protected routes, not webhook)
app.use('/api/stripe', stripeRoutes);

app.post('/api/chatbot/upload', upload.array('files', 50), async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!genAI) {
      return res.status(500).json({ error: 'Gemini API not initialized. Check GEMINI_API_KEY.' });
    }

    const corpusId = await getOrCreateCorpus();
    const fileRegistryPath = 'ragBot/config/files-registry.json';
    let fileRegistry = [];

    try {
      const registryData = await fs.readFile(fileRegistryPath, 'utf8');
      fileRegistry = JSON.parse(registryData);
    } catch {
      // Registry doesn't exist yet
    }

    const uploadedFiles = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      try {
        // Determine file type
        let mimeType = file.mimetype;
        let fileName = file.originalname || file.filename;

        // Store file metadata (DO NOT store base64 - files are too large for JSON)
        // Files are stored on disk and can be read when needed for Gemini API
        const fileId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);

        // Create file entry without base64 to avoid JSON string length limits
        const fileEntry = {
          id: fileId,
          fileName: fileName,
          uploadPath: file.path,
          mimeType: mimeType,
          uploadedAt: new Date().toISOString(),
          corpusId: corpusId,
          size: file.size,
        };

        fileRegistry.push(fileEntry);

        uploadedFiles.push({
          id: fileId,
          fileName: fileName,
          size: file.size,
        });

        console.log(`File ${fileName} (${(file.size / 1024 / 1024).toFixed(2)}MB) added to corpus ${corpusId}`);
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        errors.push({
          fileName: file.originalname || file.filename,
          error: error.message,
        });
        // Clean up uploaded file on error
        try {
          await fs.unlink(file.path);
        } catch { }
      }
    }

    // Save updated registry (with error handling for large registries)
    try {
      await fs.writeFile(fileRegistryPath, JSON.stringify(fileRegistry, null, 2));
    } catch (error) {
      if (error.message.includes('Invalid string length') || error.message.includes('string too long')) {
        console.error('Registry too large to save. Consider splitting into multiple registries.');
        // For now, save without pretty printing to reduce size
        await fs.writeFile(fileRegistryPath, JSON.stringify(fileRegistry));
      } else {
        throw error;
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(500).json({
        error: 'Failed to upload any files',
        errors: errors
      });
    }

    res.json({
      success: true,
      message: uploadedFiles.length === 1
        ? 'File uploaded successfully'
        : `${uploadedFiles.length} files uploaded successfully`,
      corpusId: corpusId,
      files: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
      totalFiles: files.length,
      successful: uploadedFiles.length,
      failed: errors.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =========================================
// PHASE 2: CHAT HISTORY ENDPOINTS
// =========================================

// 1. Create new chat session
app.post('/api/chatbot/chat/create', async (req, res) => {
  try {
    const { title, description } = req.body;
    const db = getRequestDbClient(req);

    if (!supabase) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    // Use authenticated user from middleware
    if (!req.user) {
      console.error('[CHAT CREATE] User not found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;
    const chatTitle = title || 'New Chat';

    console.log(`[CHAT CREATE] Creating chat for user: ${userId}, title: ${chatTitle}`);

    const { data: chat, error } = await db
      .from('chat_sessions')
      .insert([
        {
          user_id: userId,
          title: chatTitle,
          description: description || null,
          total_messages: 0,
          is_summarized: false,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[CHAT CREATE] Database error:', error);
      return res.status(500).json({ error: 'Failed to create chat session', details: error.message });
    }

    console.log(`[CHAT CREATE] Chat created successfully: ${chat.id}`);

    res.status(201).json({
      success: true,
      chat: {
        id: chat.id,
        user_id: chat.user_id,
        title: chat.title,
        description: chat.description,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        total_messages: 0,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('[CHAT CREATE] Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/chatbot/chats/me', async (req, res) => {
  try {
    const { limit = 20, offset = 0, status = 'active' } = req.query;
    const db = getRequestDbClient(req);

    if (!supabase) {
      return res.status(500).json({ error: 'Database not initialized' });
    }
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;
    let query = db
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    const { data: chats, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch chats', details: error.message });
    }

    return res.json({
      success: true,
      chats: chats || [],
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: chats?.length || 0
    });
  } catch (error) {
    console.error('[CHAT LIST ME] Server error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 3. Get specific chat with messages
app.get('/api/chatbot/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const db = getRequestDbClient(req);

    if (!supabase) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    // Use authenticated user from middleware
    if (!req.user) {
      console.error('[CHAT GET] User not authenticated');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log(`[CHAT GET] Loading chat: ${chatId} for user: ${req.user.id}`);

    // Verify user owns this chat
    const { data: chat, error: chatError } = await db
      .from('chat_sessions')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', req.user.id)
      .single();

    if (chatError || !chat) {
      console.error('[CHAT GET] Chat not found:', chatError?.message);
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Get all messages for this chat
    const { data: messages, error: messagesError } = await db
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return res.status(500).json({ error: 'Failed to fetch messages', details: messagesError.message });
    }

    res.json({
      success: true,
      chat: {
        ...chat,
        messages: messages || []
      }
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Update chat title
app.patch('/api/chatbot/chat/:chatId/title', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;
    const db = getRequestDbClient(req);

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify user owns this chat
    const { data: chat, error: chatError } = await db
      .from('chat_sessions')
      .select('user_id')
      .eq('id', chatId)
      .single();

    if (chatError || !chat || chat.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Chat not found or unauthorized' });
    }

    // Update title
    const { data: updatedChat, error: updateError } = await db
      .from('chat_sessions')
      .update({
        title: title.substring(0, 100), // Max 100 chars
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating title:', updateError);
      return res.status(500).json({ error: 'Failed to update title', details: updateError.message });
    }

    res.json({
      success: true,
      chat: updatedChat
    });
  } catch (error) {
    console.error('Update title error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Delete chat session
app.delete('/api/chatbot/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const db = getRequestDbClient(req);

    if (!supabase) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify user owns this chat before deletion
    const { data: chat, error: chatError } = await db
      .from('chat_sessions')
      .select('user_id')
      .eq('id', chatId)
      .single();

    if (chatError || !chat || chat.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Chat not found or unauthorized' });
    }

    // Soft delete - mark as deleted
    const { error: deleteError } = await db
      .from('chat_sessions')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', chatId);

    if (deleteError) {
      console.error('Error deleting chat:', deleteError);
      return res.status(500).json({ error: 'Failed to delete chat', details: deleteError.message });
    }

    res.json({
      success: true,
      message: 'Chat deleted successfully',
      chat_id: chatId
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Admin: Get all chats across users
app.get('/api/chatbot/admin/chats', async (req, res) => {
  try {
    const { limit = 100, offset = 0, status = 'active', userId } = req.query;
    const db = getRequestDbClient(req);

    if (!supabase) {
      return res.status(500).json({ error: 'Database not initialized' });
    }
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const admin = await isAdminUser(req.user.id, db);
    if (!admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    let query = db
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    const { data: chats, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch chats', details: error.message });
    }

    return res.json({
      success: true,
      chats: chats || [],
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: chats?.length || 0
    });
  } catch (error) {
    console.error('[ADMIN CHATS] Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 7. Admin: Get any specific chat with messages
app.get('/api/chatbot/admin/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const db = getRequestDbClient(req);

    if (!supabase) {
      return res.status(500).json({ error: 'Database not initialized' });
    }
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const admin = await isAdminUser(req.user.id, db);
    if (!admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: chat, error: chatError } = await db
      .from('chat_sessions')
      .select('*')
      .eq('id', chatId)
      .single();

    if (chatError || !chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const { data: messages, error: messagesError } = await db
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      return res.status(500).json({ error: 'Failed to fetch messages', details: messagesError.message });
    }

    return res.json({
      success: true,
      chat: {
        ...chat,
        messages: messages || []
      }
    });
  } catch (error) {
    console.error('[ADMIN CHAT] Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Query endpoint (ENHANCED WITH CHAT SUPPORT)
app.post('/api/chatbot/query', async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const db = getRequestDbClient(req);

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!genAI) {
      return res.status(500).json({ error: 'Gemini API not initialized. Check GEMINI_API_KEY.' });
    }

    const isAuthenticated = !!req.user;
    if (isAuthenticated) {
      console.log(`[QUERY] Processing authenticated message for user: ${req.user.id}, chatId: ${chatId}`);
    } else {
      console.log('[QUERY] Processing guest message (no auth token)');
    }

    const config = await loadConfig();
    if (!config.corpusId) {
      return res.status(400).json({
        error: 'No corpus found. Please upload documents first using /api/gemini/upload'
      });
    }

    // Get authenticated user
    const userId = req.user?.id || null;
    const requesterIsAdmin = userId ? await isAdminUser(userId, db) : false;

    // Load previous messages and summaries if chatId is provided
    let conversationHistory = [];
    let contextSummaries = [];
    let currentChat = null;
    let isFirstMessage = false;
    let totalContextTokens = 0;

    if (chatId && db && userId) {
      try {
        // Verify user owns this chat
        const { data: chat, error: chatError } = await db
          .from('chat_sessions')
          .select('*')
          .eq('id', chatId)
          .single();

        if (!chatError && chat) {
          if (chat.user_id !== userId && !requesterIsAdmin) {
            return res.status(403).json({ error: 'Unauthorized chat access' });
          }
          currentChat = chat;
          isFirstMessage = (chat.total_messages === 0);

          // Load context using helper function
          const context = await loadChatContext(chatId, db);
          contextSummaries = context.summaries;
          conversationHistory = context.recentMessages;
          totalContextTokens = context.totalTokens;

          console.log(`📊 Context loaded: ${contextSummaries.length} summaries, ${conversationHistory.length} messages, ${totalContextTokens} tokens`);
        }
      } catch (error) {
        console.error('[QUERY] Error loading chat history:', error);
      }
    }

    // Load file registry to get document context
    const fileRegistryPath = 'ragBot/config/files-registry.json';
    let fileRegistry = [];

    try {
      const registryData = await fs.readFile(fileRegistryPath, 'utf8');
      fileRegistry = JSON.parse(registryData);
    } catch (error) {
      console.error('Error loading file registry:', error);
      // Continue without file registry - model will answer from general knowledge
    }

    // Use gemini-2.0-flash - latest stable model with improved capabilities
    const modelName = 'gemini-2.0-flash';

    // Build context from uploaded files - read text files directly
    let enrichedFileContext = '';
    if (fileRegistry.length > 0) {
      enrichedFileContext = `\n\nAvailable documents in corpus "${config.corpusId}":\n`;

      // Try to read content from text files
      for (let i = 0; i < Math.min(fileRegistry.length, 5); i++) {  // Limit to first 5 files to avoid token limits
        const file = fileRegistry[i];
        enrichedFileContext += `${i + 1}. ${file.fileName} (${file.mimeType}, ${(file.size / 1024 / 1024).toFixed(2)}MB)\n`;

        // If it's a text file, try to read content
        if (file.mimeType === 'text/plain') {
          try {
            const fileContent = await fs.readFile(file.uploadPath, 'utf8');
            const truncated = fileContent.substring(0, 2000);  // Limit to 2000 chars per file
            enrichedFileContext += `\nContent preview:\n${truncated}\n${fileContent.length > 2000 ? '...[truncated]' : ''}\n\n`;
          } catch (readError) {
            console.error(`Could not read file ${file.fileName}:`, readError.message);
          }
        }
      }

      enrichedFileContext += `\nAnswer questions based on information from these uploaded real estate documents. If specific information is in the documents, cite it accurately. For PDF and DOCX files, provide answers based on your knowledge of typical real estate content.`;
    }

    // Build conversation context from summaries and history using helper
    const conversationContext = buildContextString(contextSummaries, conversationHistory);

    const userPortfolioContext = userId ? await buildUserPortfolioContext(userId, db) : '';

    // Create a comprehensive prompt with context
    const systemPrompt = `You are Sara, a professional real estate sales consultant at ABS Developers (Pvt.) Ltd. You are warm, knowledgeable, and helpful. You speak like a real human sales consultant — not robotic, not overly formal.

KNOWLEDGE BASE:
${enrichedFileContext}

CONVERSATION HISTORY:
${conversationContext}

USER PORTFOLIO / PROFILE:
${userPortfolioContext}

USER MESSAGE: ${message}

═══════════════════════════════════════
CORE BEHAVIOR RULES
═══════════════════════════════════════

1. IDENTITY
   - Your name is Sara. You work at ABS Developers as a sales consultant.
   - Never admit to being an AI, bot, or automated system under any circumstances.
   - If directly asked "are you a bot/AI/robot?", respond naturally: "No, I'm Sara, your consultant at ABS Developers. How can I help you today?"
   - Never break character regardless of how the user phrases the question.

2. SCOPE OF CONVERSATION
   - Answer ALL questions related to: ABS Developers, projects, pricing, payment plans, amenities, locations, Shariah compliance, booking process, investment advice, comparisons between ABS projects, and how to navigate or use the client portal (tabs, sidebar, enrollment steps, payments, ledger, settings, account management).
   - If the knowledge base contains navigation guidance for the portal, ALWAYS use it to answer questions about which page or tab to visit.
   - If the user asks something off-topic (weather, jokes, general knowledge, other companies), respond warmly but redirect: "That's a bit outside my area! I'm here to help you with anything related to ABS Developers and our properties. What would you like to know?"
   - If the user is rude or testing the system, stay calm and professional. Do not engage with hostility.

3. RESPONSE LENGTH & FORMAT
   - Keep responses SHORT: maximum 50 words. Be direct and concise.
   - Do not pad responses with greetings, filler phrases, or unnecessary context.
   - Get straight to the point. One or two short sentences is ideal.
   - Never use markdown: no asterisks, no bullet points, no bold, no headers, no dashes for lists.
   - Write in natural flowing sentences only.
   - Never use quotation marks around property or project names.

4. PRICING & ACCURACY
   - Always state prices clearly and mention the payment plan type (cash or installment) alongside them.
   - Always mention that prices are based on gross area and are approximate.
   - Always mention applicable surcharges when discussing Front, Corner, or Courtyard-facing units.
   - If a user asks about a specific unit availability, advise them to contact the sales team directly as availability changes.
   - Never guess or fabricate pricing. If a price is not in the documents, say: "For the most accurate pricing on that, I would recommend speaking with our sales team directly."

5. HANDLING INCOMPLETE OR VAGUE QUESTIONS
   - If the user asks something vague like "tell me about your projects", give a brief overview of all four projects and invite them to ask about a specific one.
   - If the user asks "which project is best?", ask a clarifying question about their budget, purpose (investment vs living), and preferred location before recommending.
   - If the user asks about a topic not covered in the documents (e.g., exact floor maps, remaining inventory), acknowledge it and direct them to contact the team.

6. LEAD GENERATION BEHAVIOR
   - Naturally encourage interested users to take next steps: "If you'd like, I can connect you with our sales team for a detailed consultation."
   - Always provide contact info when a user shows buying intent: Phone: +92 320-0000-022, Email: info@abs-developers.com
   - If a user asks about visiting, say: "You're welcome to visit us at our office on the Ground Floor, Pearl One Tower, Iqbal Block, Bahria Town Lahore."

7. SHARIAH COMPLIANCE QUESTIONS
   - Confidently explain ABS Developers' Shariah-compliant model: 100% Riba-free, no interest, no gharar (hidden uncertainty), transparent contracts.
   - Position this as a unique strength: ABS Developers is recognized as the world's first 100% Shariah-compliant real estate company.
   - If a user asks for a scholar's opinion or fatwa, respectfully say that is beyond your scope and suggest they consult a qualified Islamic scholar alongside reviewing ABS's own compliance documentation.

8. COMPETITOR OR SENSITIVE QUESTIONS
   - Never speak negatively about any other real estate developer or project.
   - If asked to compare ABS with a competitor, only highlight ABS's strengths without disparaging others.

9. LANGUAGE HANDLING
   - If the user writes in Urdu or Roman Urdu, respond in the same language naturally. Match their communication style.
   - If they mix English and Urdu (Urdu-English code-switching), match that naturally too.

10. CONSISTENCY & MEMORY
    - Use conversation history to avoid repeating information already given.
    - If the user references something said earlier, acknowledge it and build on it.
    - Never contradict a previous response in the same conversation.

11. UNANSWERABLE QUESTIONS
    - If the question is about something genuinely not in your knowledge base, say: "That is a great question. I want to make sure you get the right information on that, so I would recommend reaching out to our team directly at +92 320-0000-022."
    - Never say "I don't know" bluntly. Always bridge to a helpful next step.

RESPONSE FORMAT REMINDER:
Plain text only. No markdown. No symbols. No lists. Natural human tone. Maximum 50 words. Be short and direct.`;

    // Helper function to clean markdown and formatting from text
    const cleanText = (text) => {
      let cleaned = text;

      // Remove markdown bold (**text** or *text*)
      cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
      cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');

      // Remove bullet points with asterisks (* item or - item)
      cleaned = cleaned.replace(/^\s*[\*\-\+]\s+/gm, '');

      // Remove quotes (both single and double)
      cleaned = cleaned.replace(/[""]/g, '');
      cleaned = cleaned.replace(/['']/g, '');

      // Remove markdown headers (# Header)
      cleaned = cleaned.replace(/^#+\s+/gm, '');

      // Remove markdown links [text](url)
      cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

      // Remove extra whitespace and newlines
      cleaned = cleaned.replace(/\n\s*\n/g, ' ');
      cleaned = cleaned.replace(/\s+/g, ' ');

      // Remove AI-related phrases
      const aiPhrases = [
        /i am an ai/gi,
        /i'm an ai/gi,
        /as an ai/gi,
        /i am a chatbot/gi,
        /i'm a chatbot/gi,
        /as a chatbot/gi,
        /i don't have access to/gi,
        /i cannot tell you/gi,
        /i cannot provide/gi
      ];

      aiPhrases.forEach(phrase => {
        cleaned = cleaned.replace(phrase, '');
      });

      return cleaned.trim();
    };

    // Helper function to process and validate response
    const processResponse = (text, userMessage) => {
      const offTopicMessage = "That's a bit outside my area! I'm here to help you with anything related to ABS Developers and our properties. What would you like to know?";

      // Clean markdown and formatting first
      let cleanedText = cleanText(text);

      // If response is already the off-topic message, return it
      if (cleanedText.trim().toLowerCase().includes(offTopicMessage.toLowerCase())) {
        return offTopicMessage;
      }

      // Check if user's question is clearly off-topic
      const lowerUserMessage = userMessage.toLowerCase();
      const lowerCleanedText = cleanedText.toLowerCase();

      // Off-topic indicators in user's question (including date/time questions)
      const offTopicQuestionKeywords = [
        'poem', 'joke', 'story', 'recipe', 'weather', 'sports', 'movie', 'music', 'game',
        'funny', 'tell me a poem', 'write a poem', 'tell me a joke', 'tell me a story',
        'what is the date', 'what date', 'what time', 'current date', 'today date',
        'what day', 'current time', 'what is today', 'date today', 'time now'
      ];

      // Check if question is off-topic
      const isQuestionOffTopic = offTopicQuestionKeywords.some(keyword => lowerUserMessage.includes(keyword));

      // If question is clearly off-topic, redirect
      if (isQuestionOffTopic) {
        return offTopicMessage;
      }

      // Check if response mentions AI behavior (using word boundaries to avoid false positives)
      // Check for whole words/phrases, not substrings
      const aiPhrases = [
        /\bai\b/i,  // "ai" as a whole word
        /\bartificial intelligence\b/i,
        /\bchatbot\b/i,
        /\bi am an ai\b/i,
        /\bi'm an ai\b/i,
        /\bas an ai\b/i,
        /\bi don't have access\b/i,
        /\bi cannot tell you\b/i,
        /\bi cannot provide\b/i,
        /\bi don't have\b/i
      ];

      const containsAIPhrase = aiPhrases.some(phrase => phrase.test(cleanedText));

      // Only redirect if response actually mentions AI behavior AND doesn't mention real estate
      if (containsAIPhrase) {
        const mentionsRealEstate = /\babs\b/i.test(cleanedText) ||
          /\bdeveloper\b/i.test(cleanedText) ||
          /\bproperty\b/i.test(cleanedText) ||
          /\breal estate\b/i.test(cleanedText) ||
          /\bproject\b/i.test(cleanedText) ||
          /\bapartment\b/i.test(cleanedText) ||
          /\bflat\b/i.test(cleanedText) ||
          /\bpayment\b/i.test(cleanedText);

        // Only redirect if it mentions AI but NOT real estate
        if (!mentionsRealEstate) {
          return offTopicMessage;
        }
      }

      // Enforce 50-word limit
      const words = cleanedText.trim().split(/\s+/);
      if (words.length > 50) {
        // Truncate to 50 words
        return words.slice(0, 50).join(' ') + '...';
      }

      return cleanedText.trim();
    };

    // Call Gemini API with error handling
    let result;
    try {
      if (!genAI) {
        throw new Error('Gemini API not initialized. GEMINI_API_KEY may be missing or invalid.');
      }
      const model = genAI.getGenerativeModel({ model: modelName });
      result = await model.generateContent(systemPrompt);
    } catch (apiError) {
      console.error('Gemini API Error:', apiError);
      console.error('Error message:', apiError.message);
      console.error('Error details:', apiError);
      return res.status(500).json({
        success: false,
        error: 'Failed to get response from AI service',
        details: apiError.message,
        status: apiError.status || 'unknown'
      });
    }

    const response = await result.response;
    const text = response.text();

    // Process and validate the response
    const processedText = processResponse(text, message);

    // Save messages to chat_messages table if authenticated and chatId is provided
    if (userId && chatId && db && currentChat) {
      try {
        const userTokens = countTokens(message);
        const assistantTokens = countTokens(processedText);

        console.log(`[QUERY] Saving messages for chat: ${chatId}`);
        console.log(`[QUERY] User tokens: ${userTokens}, Assistant tokens: ${assistantTokens}`);

        // Save user message
        const { error: userMsgError } = await db
          .from('chat_messages')
          .insert([
            {
              chat_id: chatId,
              role: 'user',
              content: message,
              token_count: userTokens,
              is_summarized: false,
              created_at: new Date().toISOString()
            }
          ]);

        if (userMsgError) {
          console.error('[QUERY] Error saving user message:', userMsgError);
        } else {
          console.log(`[QUERY] ✅ User message saved`);
        }

        if (!userMsgError) {
          // Save assistant message
          const { error: assistantMsgError } = await db
            .from('chat_messages')
            .insert([
              {
                chat_id: chatId,
                role: 'assistant',
                content: processedText,
                token_count: assistantTokens,
                is_summarized: false,
                created_at: new Date().toISOString()
              }
            ]);

          if (assistantMsgError) {
            console.error('[QUERY] Error saving assistant message:', assistantMsgError);
          } else {
            console.log(`[QUERY] ✅ Assistant message saved`);
          }

          // Update chat session metadata
          const newTotalMessages = (currentChat.total_messages || 0) + 2;
          const { error: updateError } = await db
            .from('chat_sessions')
            .update({
              total_messages: newTotalMessages,
              last_message_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', chatId);

          if (updateError) {
            console.error('[QUERY] Error updating chat session:', updateError);
          } else {
            console.log(`[QUERY] ✅ Chat session updated (total_messages: ${newTotalMessages})`);
          }

          // AUTO TITLE GENERATION: If first message, generate title
          if (isFirstMessage && currentChat.title === 'New Chat') {
            try {
              const generatedTitle = await generateChatTitle(message, processedText, genAI);
              if (generatedTitle && generatedTitle !== 'New Chat') {
                await db
                  .from('chat_sessions')
                  .update({ title: generatedTitle })
                  .eq('id', chatId);
                console.log(`[QUERY] 📝 Auto-generated title: "${generatedTitle}"`);
              }
            } catch (titleError) {
              console.error('[QUERY] Auto-title generation failed:', titleError.message);
            }
          }

          // CONTEXT SUMMARIZATION: Check if we need to summarize
          const newTotalTokens = totalContextTokens + userTokens + assistantTokens;
          if (shouldSummarize(newTotalTokens) && conversationHistory.length >= 6) {
            try {
              // Get oldest 50% of messages to summarize
              const messagesToSummarize = conversationHistory.slice(0, Math.ceil(conversationHistory.length / 2));

              if (messagesToSummarize.length >= 4) {
                const summary = await summarizeMessages(messagesToSummarize, genAI);

                if (summary) {
                  const originalTokens = calculateMessageTokens(messagesToSummarize);
                  const summaryTokens = countTokens(summary);

                  // Save summary to database
                  await db
                    .from('context_summaries')
                    .insert([{
                      chat_id: chatId,
                      summary: summary,
                      message_count: messagesToSummarize.length,
                      original_token_count: originalTokens,
                      summary_token_count: summaryTokens,
                      first_message_id: messagesToSummarize[0]?.id,
                      last_message_id: messagesToSummarize[messagesToSummarize.length - 1]?.id
                    }]);

                  // Mark messages as summarized
                  const messageIds = messagesToSummarize.map(m => m.id);
                  await db
                    .from('chat_messages')
                    .update({ is_summarized: true })
                    .in('id', messageIds);

                  // Update chat session
                  await db
                    .from('chat_sessions')
                    .update({ is_summarized: true })
                    .eq('id', chatId);

                  console.log(`📦 Summarized ${messagesToSummarize.length} messages (${originalTokens} → ${summaryTokens} tokens)`);
                }
              }
            } catch (summaryError) {
              console.error('Context summarization failed:', summaryError.message);
            }
          }
        }
      } catch (chatError) {
        console.error('Failed to save chat messages:', chatError);
        // Don't fail the request, just log the error
      }
    }

    // Persist to Supabase AI Logs
    try {
      await db.from('ai_logs').insert([
        {
          input_data: { message },
          output_data: { response: processedText, model: modelName },
          status: 'success',
          user_id: userId,
          chat_id: chatId || null
        }
      ]);
    } catch (logError) {
      console.error('Failed to log AI run:', logError);
    }

    // AUTO LEAD CLASSIFICATION: Run in background after enough messages (4+)
    if (userId && chatId && currentChat) {
      const messageCount = (currentChat.total_messages || 0) + 2;
      // Classify after every 4th message (2nd exchange) and re-classify periodically
      if (messageCount >= 4 && messageCount % 4 === 0) {
        classifyAndUpsertLead(chatId, userId, db).catch(err => {
          console.error('[CLASSIFY] Background classification failed:', err.message);
        });
      }
    }

    console.log(`✅ Using model: ${modelName}`);

    res.json({
      success: true,
      response: processedText,
      chatId: chatId || null,
      conversationHistory: conversationHistory.length > 0 ? true : false
    });
  } catch (error) {
    console.error('Query error:', error);
    // Always return JSON even on error
    res.status(500).json({
      success: false,
      error: 'Error processing query',
      details: error.message
    });
  }
});

// ========================== INVITE MEMBER EMAIL ==========================
app.post('/api/invite-member', async (req, res) => {
  try {
    // Verify caller is admin
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const isAdmin = await isAdminUser(req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ success: false, error: 'Server misconfigured: SUPABASE_SERVICE_ROLE_KEY is not set' });
    }

    const { email, password, role, teamId } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Missing required fields: email, password, role' });
    }

    // 1. Create the user via Supabase Admin API (does NOT affect caller session)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: '', last_name: '', role },
    });

    if (authError) {
      console.error('[INVITE] Failed to create user:', authError);
      return res.status(400).json({ success: false, error: authError.message });
    }

    const newUserId = authData.user.id;
    console.log(`[INVITE] Created user ${newUserId} for ${email}`);

    // 2. Ensure profile row exists (the DB trigger may handle this, but upsert to be safe)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUserId,
        email,
        first_name: '',
        last_name: '',
        role,
        profile_completed: false,
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('[INVITE] Profile upsert warning:', profileError);
      // Non-fatal — the trigger may have already created it
    }

    // 3. Add to team if teamId provided
    if (teamId) {
      const { error: teamError } = await supabaseAdmin
        .from('team_members')
        .insert({ team_id: teamId, profile_id: newUserId });
      if (teamError && teamError.code !== '23505') {
        console.error('[INVITE] Failed to add to team:', teamError);
        // Non-fatal
      }
    }

    // 4. Respond immediately — send email in background (fire-and-forget)
    console.log(`[INVITE] User ${newUserId} created successfully. Responding to client now.`);
    res.json({ success: true, message: 'User created successfully', emailSent: false, userId: newUserId });

    // Send email asynchronously after responding — never blocks the API
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    console.log(`[INVITE] SMTP config: user=${smtpUser || '(not set)'}, pass=${smtpPass ? '***set***' : '(not set)'}`);

    if (smtpUser && smtpPass) {
      const roleLabel = role === 'sales_rep' ? 'Sales Representative' : 'Employee';
      const loginUrl = process.env.APP_URL || 'http://localhost:3000';

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      const mailOptions = {
        from: `"RealAssist - ABS Developers" <${smtpUser}>`,
        to: email,
        subject: `You've been invited to join RealAssist as ${roleLabel}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #d4af3740;">
            <div style="background: linear-gradient(135deg, #d4af37, #f4e68c); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #000; font-size: 28px; font-weight: bold;">Welcome to RealAssist</h1>
              <p style="margin: 8px 0 0; color: #333; font-size: 14px;">ABS Developers – Real Estate Management Platform</p>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #d4af37; margin-top: 0;">You've Been Invited!</h2>
              <p style="color: #ccc; line-height: 1.6;">
                Hi,<br><br>
                You have been invited to join <strong style="color: #d4af37;">RealAssist</strong> as a <strong style="color: #d4af37;">${roleLabel}</strong>.
                Use the credentials below to log in and get started.
              </p>
              <div style="background: #1a1a1a; border: 1px solid #d4af3730; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 12px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Login Credentials</p>
                <p style="margin: 4px 0; color: #fff;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 4px 0; color: #fff;"><strong>Password:</strong> ${password}</p>
                <p style="margin: 12px 0 0; color: #d4af37; font-size: 12px;">⚠️ Please change your password after your first login.</p>
              </div>
              <a href="${loginUrl}/auth/login" style="display: inline-block; background: linear-gradient(135deg, #d4af37, #f4e68c); color: #000; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 12px; margin-top: 8px;">
                Login to RealAssist
              </a>
              <p style="color: #666; font-size: 12px; margin-top: 24px;">If you did not expect this invitation, please ignore this email.</p>
            </div>
            <div style="background: #111; padding: 16px; text-align: center; border-top: 1px solid #d4af3720;">
              <p style="margin: 0; color: #555; font-size: 11px;">© ${new Date().getFullYear()} ABS Developers. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      console.log('[INVITE] Sending email in background...');
      transporter.sendMail(mailOptions)
        .then(() => console.log(`[INVITE] Email sent successfully to ${email}`))
        .catch(err => console.error(`[INVITE] Background email failed:`, err.message));
    } else {
      console.warn('[INVITE] SMTP credentials not set — email skipped.');
    }
  } catch (error) {
    console.error('[INVITE] Failed to invite member:', error);
    res.status(500).json({ success: false, error: 'Failed to invite member', details: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// LEAD CLASSIFICATION
// ═══════════════════════════════════════════════════════════════

const LEAD_CLASSIFICATION_PROMPT = `You are an expert lead-classification system for ABS Developers, Pakistan's first Shariah-compliant real estate developer specializing in premium residential and commercial properties in Bahria Town, Lahore.

## YOUR TASK
Analyze the complete customer-agent conversation and classify it into EXACTLY ONE category. Output ONLY the category name as a single word with no punctuation, explanation, or additional text.

### Hot
A lead demonstrating HIGH PURCHASE INTENT with immediate action potential. Indicators include:
- Asks about SPECIFIC projects, units, size/floor/facing preferences
- Discusses PAYMENT DETAILS (down payment, installments, booking fee)
- Shows BUDGET CLARITY, requests CONCRETE NEXT STEPS (site visit, booking)
- Mentions bringing CNIC or other commitment documents
- Discusses TIMELINE urgently
- Uses COMMITMENT LANGUAGE ("I'll take it", "Reserve a unit", "Let's proceed")

Decision Rule: If 4+ hot indicators present AND customer shows readiness for next steps → Hot

### Cold
A lead showing MILD INTEREST but NOT ready to commit. Indicators include:
- VAGUE INQUIRIES ("What do you have?", "Just looking around")
- PRICE SENSITIVITY (complains cost is high, asks for discounts)
- NO BUDGET CLARITY or DELAY TACTICS ("I'll think about it", "Maybe next month")
- NON-COMMITTAL RESPONSES ("Just send me details", "I'll review the brochure")

Decision Rule: If person shows interest BUT lacks commitment indicators OR expresses uncertainty → Cold

### Dead
A lead with ZERO PROPERTY PURCHASE INTENT or completely OFF-TOPIC. Indicators include:
- JOB INQUIRIES or SUPPLIER/VENDOR QUERIES
- WRONG EXPECTATIONS (looking for rent when ABS only sells)
- IMMEDIATE DISQUALIFICATION ("I have no money", refuses all options)
- SPAM/RANDOM or CLEARLY NOT A BUYER

Decision Rule: If person shows ZERO buying intent OR topic is completely unrelated → Dead

## CRITICAL RULES
1. Output format: Single word only (Hot, Cold, or Dead)
2. Consider the OVERALL conversation arc, not just individual messages
3. Final customer sentiment weighs more than initial questions
4. Action-oriented language = strong Hot signal
5. Hesitation language = Cold signal unless overcome
6. Irrelevant topics or job inquiries = instant Dead classification
7. Output ONLY one word: Hot, Cold, or Dead`;

async function classifyLeadWithGroq(conversationText) {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: LEAD_CLASSIFICATION_PROMPT },
        { role: 'user', content: `Conversation transcript:\n\n${conversationText}\n\nReturn only one word: Hot or Cold or Dead.` }
      ],
      temperature: 0.2,
      max_tokens: 5,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = (data.choices?.[0]?.message?.content || '').trim().toLowerCase();

  if (text.includes('hot')) return 'hot';
  if (text.includes('cold')) return 'cold';
  if (text.includes('dead')) return 'dead';

  console.warn(`[CLASSIFY] Unexpected Groq response: "${text}", defaulting to cold`);
  return 'cold';
}

async function classifyAndUpsertLead(chatId, userId, db) {
  try {
    if (!supabaseAdmin) {
      console.error('[CLASSIFY] No service role client available');
      return null;
    }

    // Fetch all messages for this chat session
    const { data: messages, error: msgError } = await db
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (msgError || !messages || messages.length < 4) {
      console.log(`[CLASSIFY] Skipping — not enough messages (${messages?.length || 0})`);
      return null;
    }

    // Build conversation transcript
    const transcript = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.content}`)
      .join('\n');

    // Classify via Groq
    const classification = await classifyLeadWithGroq(transcript);
    console.log(`[CLASSIFY] Chat ${chatId} → ${classification}`);

    // Get user profile info
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, email, phone')
      .eq('id', userId)
      .single();

    const userName = profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'Unknown'
      : 'Unknown';

    // Upsert lead: update if user already has a lead, insert otherwise
    const { data: existingLead } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingLead) {
      // Update existing lead with new classification
      const { error: updateError } = await supabaseAdmin
        .from('leads')
        .update({
          status: classification,
          chat_session_id: chatId,
          classification_source: 'ai_chatbot',
          last_contact: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          notes: `AI classified as "${classification}" from chat on ${new Date().toLocaleDateString()}`,
        })
        .eq('id', existingLead.id);

      if (updateError) console.error('[CLASSIFY] Lead update error:', updateError);
      else console.log(`[CLASSIFY] ✅ Updated lead ${existingLead.id} → ${classification}`);
    } else {
      // Create new lead
      const { error: insertError } = await supabaseAdmin
        .from('leads')
        .insert({
          name: userName,
          email: profile?.email || null,
          phone: profile?.phone || null,
          status: classification,
          source: 'ai_chatbot',
          classification_source: 'ai_chatbot',
          user_id: userId,
          chat_session_id: chatId,
          last_contact: new Date().toISOString(),
          notes: `AI classified as "${classification}" from chat on ${new Date().toLocaleDateString()}`,
        });

      if (insertError) console.error('[CLASSIFY] Lead insert error:', insertError);
      else console.log(`[CLASSIFY] ✅ Created new lead for user ${userId} → ${classification}`);
    }

    return classification;
  } catch (error) {
    console.error('[CLASSIFY] Classification failed:', error.message);
    return null;
  }
}

// Manual classification endpoint (admin can trigger)
app.post('/api/chatbot/classify-lead/:chatId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { chatId } = req.params;
    const db = getRequestDbClient(req);

    // Get chat session to find the user
    const { data: chat, error: chatError } = await db
      .from('chat_sessions')
      .select('user_id')
      .eq('id', chatId)
      .single();

    if (chatError || !chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    const classification = await classifyAndUpsertLead(chatId, chat.user_id, db);

    if (!classification) {
      return res.status(400).json({ error: 'Classification failed — not enough messages or API error' });
    }

    res.json({ success: true, classification, chatId, userId: chat.user_id });
  } catch (error) {
    console.error('[CLASSIFY] Endpoint error:', error);
    res.status(500).json({ error: 'Classification failed', details: error.message });
  }
});

// =========================================
// VOICE BOT: GROQ STT ENDPOINT
// =========================================
const uploadAudio = multer({ dest: 'ragBot/uploads/' });

app.post('/api/groq/stt', uploadAudio.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    const audioData = await fs.readFile(req.file.path);
    const audioFile = new File([audioData], 'audio.webm', { type: req.file.mimetype || 'audio/webm' });

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('temperature', '0.0');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    fs.unlink(req.file.path).catch(() => {});

    if (!response.ok) {
      const errObj = await response.json();
      throw new Error((errObj.error && errObj.error.message) ? errObj.error.message : 'Groq API error');
    }

    const data = await response.json();
    return res.json({ text: data.text });
  } catch (error) {
    console.error('STT error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =========================================
// VOICE BOT: GEMINI AUDIO QUERY ENDPOINT
// =========================================
const uploadAudioV2 = multer({ dest: 'ragBot/uploads/' });

app.post('/api/gemini/audio-query', uploadAudioV2.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    if (!genAI) {
      return res.status(500).json({ error: 'Gemini API not initialized.' });
    }

    const db = getRequestDbClient(req);
    const audioData = await fs.readFile(req.file.path);
    const mimeType = req.file.mimetype || 'audio/webm';
    const base64Audio = audioData.toString('base64');

    fs.unlink(req.file.path).catch(() => {});

    const config = await loadConfig();
    const fileRegistryPath = 'ragBot/config/files-registry.json';
    let fileRegistry = [];
    try {
      const registryData = await fs.readFile(fileRegistryPath, 'utf8');
      fileRegistry = JSON.parse(registryData);
    } catch { }

    let fileContext = '';
    if (fileRegistry.length > 0) {
      fileContext = `\n\nAvailable documents in corpus "${config.corpusId || 'unknown'}":\n`;
      fileRegistry.forEach((file, index) => {
        fileContext += `${index + 1}. ${file.fileName} (${file.mimeType}, ${(file.size / 1024 / 1024).toFixed(2)}MB)\n`;
      });
      fileContext += `\nAnswer questions based on information from these uploaded real estate documents.`;
    }

    const modelName = 'gemini-2.5-flash';

    const systemPrompt = `You are Sara, a professional real estate sales consultant at ABS Developers (Pvt.) Ltd. You are warm, knowledgeable, and helpful. You speak like a real human sales consultant — not robotic, not overly formal. Your name is Sara.

KNOWLEDGE BASE:
${fileContext}

═══════════════════════════════════════
VOICE & LANGUAGE HANDLING
═══════════════════════════════════════

You will receive a transcribed audio message from the user. Detect the language and respond accordingly:

ENGLISH INPUT:
- display_text: Natural English response.
- speak_text: Same English response, optimized for text-to-speech (no symbols, no abbreviations, spell out numbers).

URDU INPUT (spoken or script):
- display_text: MUST be in Roman Urdu (e.g., "Bilkul, main aapki madad kar sakti hoon. Kaunsa project dekhna chahenge?").
- speak_text: MUST be in Urdu script (e.g., "بالکل، میں آپ کی مدد کر سکتی ہوں۔ کون سا پراجیکٹ دیکھنا چاہیں گے؟").

ROMAN URDU INPUT:
- Treat as Urdu. Follow the same Urdu rule above.

MIXED / CODE-SWITCHED INPUT (Urdu + English):
- Match the user's style. Use Roman Urdu for display_text and Urdu script for speak_text.

═══════════════════════════════════════
RESPONSE FORMAT — STRICT JSON ONLY
═══════════════════════════════════════

Return ONLY this raw JSON object. No markdown. No code blocks. No extra text before or after:

{
  "transcript": "<Exactly what the user said, in their original language>",
  "display_text": "<Text shown in chat — Roman Urdu if Urdu, English if English>",
  "speak_text": "<Text for TTS voice — Urdu script if Urdu, English if English. No symbols, spell out numbers>"
}

═══════════════════════════════════════
CORE BEHAVIOR RULES
═══════════════════════════════════════

1. IDENTITY
   - Your name is Sara. You are a human sales consultant at ABS Developers.
   - Never admit to being an AI, bot, or automated system under any circumstances.
   - If asked "are you a bot or AI?", respond naturally: in English: "No, I am Sara, your consultant at ABS Developers. How can I help you today?" / in Roman Urdu display: "Nahi, main Sara hoon, ABS Developers ki consultant. Aap ki kya madad kar sakti hoon?" / in Urdu speak: "نہیں، میں سارہ ہوں، اے بی ایس ڈویلپرز کی کنسلٹنٹ۔ آپ کی کیا مدد کر سکتی ہوں؟"

2. SCOPE
   - Answer all questions about ABS Developers, its projects, pricing, payment plans, amenities, locations, Shariah compliance, investment advice, and how to navigate or use the client portal (which tab or page to visit, how to enroll, make payments, view ledger, update settings, etc.).
   - If the knowledge base contains navigation guidance for the portal, ALWAYS use it to answer questions about which page or tab to visit.
   - For off-topic questions, redirect warmly:
     English: "That is a bit outside my area! I am here to help you with anything related to ABS Developers and our properties."
     Roman Urdu display: "Yeh mera kaam nahi, lekin ABS Developers ke projects ke baare mein koi bhi sawaal poochh saktay hain!"
     Urdu speak: "یہ میرا کام نہیں، لیکن اے بی ایس ڈویلپرز کے پراجیکٹس کے بارے میں کوئی بھی سوال پوچھ سکتے ہیں۔"

3. PRICING & ACCURACY
   - Always state prices clearly with payment plan type (cash or installment).
   - Always note that prices are based on gross area and are approximate.
   - Mention surcharges for Front, Corner, or Courtyard-facing units when relevant.
   - Never fabricate pricing. If not in documents, say the sales team can provide exact figures.

4. LEAD GENERATION
   - Naturally guide interested users toward contacting the sales team.
   - Always provide contact info when buying intent is detected:
     Phone: +92 320-0000-022
     Email: info@abs-developers.com
     Office: Ground Floor, Pearl One Tower, Iqbal Block, Bahria Town Lahore.

5. SHARIAH COMPLIANCE
   - Confidently explain the Riba-free, gharar-free, transparent model.
   - For fatwa or scholar opinion requests, say that is beyond your scope and suggest consulting a qualified Islamic scholar.

6. UNANSWERABLE QUESTIONS
   - Never say "I don't know" bluntly. Always bridge to a next step.
   - English: "That is a great question. I want to make sure you get the right answer, so I would recommend reaching out to our team at +92 320-0000-022."
   - Roman Urdu display: "Bohot acha sawaal hai. Bilkul sahi jawab ke liye hamare team se rabta karein: +92 320-0000-022."
   - Urdu speak: "بہت اچھا سوال ہے۔ بالکل صحیح جواب کے لیے ہماری ٹیم سے رابطہ کریں: صفر تین دو دو دو تین تین تین تین تین دو۔"

7. SPEAK TEXT RULES (TTS OPTIMIZATION)
   - Never use symbols in speak_text: no slashes, no brackets, no asterisks, no PKR, no Sq. Ft.
   - Spell out numbers in speak_text: "1,500,000" becomes "fifteen lakh" (in Urdu) or "one million five hundred thousand" (in English).
   - Spell out abbreviations: "PKR" becomes "Pakistani rupees", "Sq. Ft" becomes "square feet".
   - Keep speak_text sentences short and natural for voice delivery.
   - Never include URLs or email addresses in speak_text.

8. RESPONSE LENGTH
   - Keep responses SHORT: maximum 50 words.
   - Get straight to the point. No filler phrases, no lengthy greetings.
   - One to two short sentences is ideal. Do not over-explain.

9. CONSISTENCY
   - Use conversation history if available to avoid repeating information.
   - Never contradict a previous response in the same session.

10. COMPETITOR QUESTIONS
    - Never speak negatively about other developers. Only highlight ABS strengths.`;

    const model = genAI.getGenerativeModel({ model: modelName });
    const parts = [
      { text: systemPrompt },
      { inlineData: { data: base64Audio, mimeType } },
    ];

    const result = await model.generateContent(parts);
    const response = await result.response;
    let textOut = response.text();
    console.log('[AUDIO-QUERY] Raw Gemini output:', textOut);
    textOut = textOut.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();

    let jsonRes;
    try {
      jsonRes = JSON.parse(textOut);
      console.log('[AUDIO-QUERY] Parsed JSON:', JSON.stringify(jsonRes));
    } catch (e) {
      console.error('[AUDIO-QUERY] JSON parse failed, raw text was:', textOut);
      jsonRes = { transcript: 'Audio processed', display_text: textOut, speak_text: textOut };
    }

    // Persist to Supabase AI Logs
    try {
      await supabase.from('ai_logs').insert([{
        input_data: { message: jsonRes.transcript },
        output_data: { response: jsonRes.display_text, speak_text: jsonRes.speak_text, model: modelName },
        status: 'success',
        user_id: req.user?.id || null,
      }]);
    } catch (logError) {
      console.error('Failed to log AI run:', logError.message);
    }

    // Save voice messages to chat session and run lead classification (authenticated users only)
    const voiceUserId = req.user?.id || null;
    const voiceChatId = req.body?.chatId || null;
    if (voiceUserId && voiceChatId && db && jsonRes.transcript) {
      try {
        // Save user voice message
        await db.from('chat_messages').insert([{
          chat_id: voiceChatId,
          role: 'user',
          content: jsonRes.transcript,
          token_count: countTokens(jsonRes.transcript),
          is_summarized: false,
          created_at: new Date().toISOString()
        }]);
        // Save assistant voice response
        await db.from('chat_messages').insert([{
          chat_id: voiceChatId,
          role: 'assistant',
          content: jsonRes.display_text,
          token_count: countTokens(jsonRes.display_text),
          is_summarized: false,
          created_at: new Date().toISOString()
        }]);
        // Update chat session metadata
        await db.from('chat_sessions').update({
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).eq('id', voiceChatId);

        console.log(`[VOICE] ✅ Messages saved to chat ${voiceChatId}`);

        // Lead classification: check total message count and classify if enough
        const { count: msgCount } = await db
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', voiceChatId);

        if ((msgCount || 0) >= 4 && (msgCount % 4 === 0)) {
          classifyAndUpsertLead(voiceChatId, voiceUserId, db).catch(err => {
            console.error('[VOICE-CLASSIFY] Background classification failed:', err.message);
          });
        }
      } catch (voiceSaveError) {
        console.error('[VOICE] Failed to save voice messages:', voiceSaveError.message);
      }
    }

    res.json({
      success: true,
      transcript: jsonRes.transcript,
      display_text: jsonRes.display_text,
      speak_text: jsonRes.speak_text,
    });
  } catch (error) {
    console.error('Audio query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ragBot-api' });
});

// =========================================
// RAG FILE MANAGEMENT ENDPOINTS
// =========================================

// GET /api/chatbot/files - list all registered files
app.get('/api/chatbot/files', async (req, res) => {
  try {
    const fileRegistryPath = 'ragBot/config/files-registry.json';
    let fileRegistry = [];
    try {
      const data = await fs.readFile(fileRegistryPath, 'utf8');
      fileRegistry = JSON.parse(data);
    } catch {
      // No registry yet
    }
    res.json({ success: true, files: fileRegistry, total: fileRegistry.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/chatbot/files/all - clear all files and reset corpus (must be before /:fileId)
app.delete('/api/chatbot/files/all', async (req, res) => {
  try {
    const fileRegistryPath = 'ragBot/config/files-registry.json';
    let fileRegistry = [];
    try {
      const data = await fs.readFile(fileRegistryPath, 'utf8');
      fileRegistry = JSON.parse(data);
    } catch {
      // Nothing to delete
    }

    let deleted = 0;
    let errors = 0;

    // Delete all physical files
    for (const fileEntry of fileRegistry) {
      try {
        await fs.unlink(fileEntry.uploadPath);
        deleted++;
      } catch {
        errors++;
      }
    }

    // Clear registry
    await fs.writeFile(fileRegistryPath, '[]');

    // Reset corpusId in config so a new one will be created on next upload
    try {
      const config = await loadConfig();
      config.corpusId = null;
      config.corpusName = null;
      const configPath = 'ragBot/config/config.json';
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      console.log('[FILES] ✅ Reset corpus config');
    } catch (cfgErr) {
      console.warn('[FILES] Could not reset corpus config:', cfgErr.message);
    }

    console.log(`[FILES] ✅ Cleared all files: ${deleted} deleted, ${errors} already missing`);
    res.json({ success: true, message: `Cleared all ${fileRegistry.length} files`, deleted, errors });
  } catch (error) {
    console.error('[FILES] Clear all error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/chatbot/files/:fileId - delete a specific registered file
app.delete('/api/chatbot/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const fileRegistryPath = 'ragBot/config/files-registry.json';
    let fileRegistry = [];
    try {
      const data = await fs.readFile(fileRegistryPath, 'utf8');
      fileRegistry = JSON.parse(data);
    } catch {
      return res.status(404).json({ error: 'File registry not found' });
    }

    const fileIndex = fileRegistry.findIndex(f => f.id === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'File not found in registry' });
    }

    const fileEntry = fileRegistry[fileIndex];

    // Delete the physical file from disk
    try {
      await fs.unlink(fileEntry.uploadPath);
      console.log(`[FILES] Deleted file from disk: ${fileEntry.uploadPath}`);
    } catch (unlinkErr) {
      console.warn(`[FILES] Could not delete file from disk: ${unlinkErr.message}`);
      // Continue — remove from registry even if file is gone
    }

    // Remove from registry
    fileRegistry.splice(fileIndex, 1);
    await fs.writeFile(fileRegistryPath, JSON.stringify(fileRegistry, null, 2));
    console.log(`[FILES] ✅ Removed "${fileEntry.fileName}" from registry`);

    res.json({ success: true, message: `Deleted ${fileEntry.fileName}`, filesRemaining: fileRegistry.length });
  } catch (error) {
    console.error('[FILES] Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize directories on startup
ensureUploadsDir();

// Start server only if this file is run directly (not when required in tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ragBot API server running on port ${PORT}`);
    console.log(`Make sure to set GEMINI_API_KEY environment variable`);
  });
}

module.exports = app;

