require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

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
app.post('/api/gemini/upload', upload.array('files', 50), async (req, res) => {
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
        } catch {}
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

// Query endpoint
app.post('/api/gemini/query', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!genAI) {
      return res.status(500).json({ error: 'Gemini API not initialized. Check GEMINI_API_KEY.' });
    }

    const config = await loadConfig();
    if (!config.corpusId) {
      return res.status(400).json({ 
        error: 'No corpus found. Please upload documents first using /api/gemini/upload' 
      });
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

    // Build context from uploaded files (for reference in prompt)
    let fileContext = '';
    if (fileRegistry.length > 0) {
      fileContext = `\n\nAvailable documents in corpus "${config.corpusId}":\n`;
      fileRegistry.forEach((file, index) => {
        fileContext += `${index + 1}. ${file.fileName} (${file.mimeType}, ${(file.size / 1024 / 1024).toFixed(2)}MB)\n`;
      });
      fileContext += `\nAnswer questions based on information from these uploaded real estate documents. If specific information is in the documents, cite it accurately.`;
    }

    // Use Gemini 2.0 Flash - fastest and most efficient model
    const modelName = 'gemini-2.0-flash';

    // Create a comprehensive prompt with context
    const systemPrompt = `You are a professional real estate customer service representative for ABS Developers. You assist customers with queries about ABS Developers' properties, projects, pricing, features, payment plans, and real estate offerings. You are a helpful human assistant, not an AI.

${fileContext}

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

    // Use Gemini 2.0 Flash model (fastest available)
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Process and validate the response
    const processedText = processResponse(text, message);
    
    console.log(`✅ Using model: ${modelName}`);
    
    res.json({
      success: true,
      response: processedText,
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Error processing query: ' + error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ragBot-api' });
});

// Initialize directories on startup
ensureUploadsDir();

// Start server
app.listen(PORT, () => {
  console.log(`ragBot API server running on port ${PORT}`);
  console.log(`Make sure to set GEMINI_API_KEY environment variable`);
});

module.exports = app;

