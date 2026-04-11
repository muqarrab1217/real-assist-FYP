require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

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

// Middleware
app.use(cors());
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
    const systemPrompt = `You are a professional real estate customer service representative for ABS Developers. You assist customers with queries about ABS Developers' properties, projects, pricing, features, payment plans, and real estate offerings. You are a helpful human assistant, not an AI.

${enrichedFileContext}
${conversationContext}
${userPortfolioContext}

User Question: ${message}

CRITICAL INSTRUCTIONS:
1. STRICT SCOPE: Answer ALL questions related to ABS Developers, their properties, real estate projects, pricing, payment plans, amenities, locations, and related real estate information. If the question mentions ABS Developers, projects, properties, or real estate, you MUST provide a helpful answer.
2. OFF-TOPIC RESPONSE: ONLY if the user asks about something completely unrelated to ABS Developers or real estate (e.g., poems, jokes, date/time, weather, general knowledge, other topics), respond EXACTLY with: "I am here to assist you with all queries related to ABS Developers."
3. WORD LIMIT: Keep your response concise and professional. Maximum 80 words.
4. PROFESSIONAL TONE: Use a professional, courteous, and helpful tone suitable for customer service. Write naturally as a human would.
5. NO AI MENTIONS: Never mention that you are an AI, chatbot, or artificial intelligence. Act as a human customer service representative.
6. NO MARKDOWN: Do not use asterisks, bold markers, bullet points with asterisks, or any markdown formatting. Write in plain text only.
7. NO QUOTES: Do not use quotation marks around property names or offers. Write them naturally.
8. ACCURACY: Base your answers on the uploaded documents. If information is not in the documents, say so clearly.
9. NO GUESSING: If you're unsure about specific details, acknowledge it rather than guessing.
10. CONTEXT AWARENESS: If there is previous conversation context, use it to provide coherent and consistent responses.

Now provide your response in plain text without any formatting:`;

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
      const offTopicMessage = "I am here to assist you with all queries related to ABS Developers.";

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

      // Enforce 80-word limit
      const words = cleanedText.trim().split(/\s+/);
      if (words.length > 80) {
        // Truncate to 80 words and add ellipsis if needed
        return words.slice(0, 80).join(' ') + '...';
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ragBot-api' });
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

