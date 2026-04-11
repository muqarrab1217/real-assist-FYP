// Conversation Summarizer - Gemini-powered summarization for long chats
// File: ragBot/server/lib/summarizer.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

class ConversationSummarizer {
  constructor(geminiApiKey) {
    if (!geminiApiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(geminiApiKey);
    this.model = 'gemini-1.5-flash';
  }

  /**
   * Summarize a batch of conversation messages
   * @param {Array} messages - Array of {role, content} objects
   * @returns {Promise<string>} - Concise summary
   */
  async summarizeMessages(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return null;
    }

    try {
      // Build conversation text
      const conversationText = messages
        .map(msg => {
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          return `${role}: ${msg.content}`;
        })
        .join('\n\n');

      const prompt = `Summarize this real estate investment conversation concisely in 2-3 sentences focusing on:
1. Key topics and questions asked
2. Important information discussed
3. Any decisions or agreements made

Keep it professional and suitable for a business context. Do not include AI-generated metadata.

Conversation:
${conversationText}

Summary:`;

      const modelInstance = this.genAI.getGenerativeModel({ model: this.model });
      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      const summary = response.text().trim();

      // Ensure summary is reasonable length (max 500 chars)
      if (summary.length > 500) {
        return summary.substring(0, 500) + '...';
      }

      return summary;
    } catch (error) {
      console.error('Summarization error:', error.message);
      throw new Error(`Failed to summarize conversation: ${error.message}`);
    }
  }

  /**
   * Generate a concise chat title from first user message and assistant response
   * @param {string} userMessage - First message from user
   * @param {string} assistantResponse - Assistant's response
   * @returns {Promise<string>} - Generated title (max 50 chars)
   */
  async generateChatTitle(userMessage, assistantResponse) {
    if (!userMessage || !assistantResponse) {
      return 'New Chat';
    }

    try {
      const prompt = `Generate a short, concise title (4-8 words, max 50 characters) for a real estate investment chat.
The conversation starts with:

User: ${userMessage.substring(0, 200)}
Assistant: ${assistantResponse.substring(0, 200)}

Title (no quotes, no explanation, only the title):`;

      const modelInstance = this.genAI.getGenerativeModel({ model: this.model });
      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      const title = response.text().trim();

      // Enforce max length and clean up
      const cleanedTitle = title
        .replace(/^["']/, '') // Remove leading quotes
        .replace(/["']$/, '') // Remove trailing quotes
        .substring(0, 50)
        .trim();

      return cleanedTitle || 'New Chat';
    } catch (error) {
      console.error('Title generation error:', error.message);
      // Return a fallback title based on first message
      return userMessage.substring(0, 40).trim() + '...';
    }
  }

  /**
   * Generate response with conversation context
   * @param {string} userMessage - Current user message
   * @param {Array} messageHistory - Previous messages
   * @param {string} fileContext - Context from RAG corpus
   * @returns {Promise<string>} - AI response
   */
  async generateContextAwareResponse(userMessage, messageHistory = [], fileContext = '') {
    try {
      // Build conversation context
      let contextString = '';

      if (messageHistory.length > 0) {
        contextString = 'Previous conversation:\n';
        for (const msg of messageHistory) {
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          contextString += `${role}: ${msg.content}\n`;
        }
        contextString += '\n---\n\n';
      }

      // Build the full prompt
      const systemPrompt = `You are a professional real estate customer service representative for ABS Developers.
You assist customers with queries about ABS Developers' properties, projects, pricing, features, payment plans,
and real estate offerings. You are a helpful human assistant, not an AI.

${fileContext ? 'Available documents:\n' + fileContext + '\n\n' : ''}

${contextString}

User: ${userMessage}

CRITICAL INSTRUCTIONS:
1. STRICT SCOPE: Answer ALL questions related to ABS Developers, their properties, real estate projects
2. OFF-TOPIC RESPONSE: Only if completely unrelated → "I am here to assist you with all queries related to ABS Developers."
3. WORD LIMIT: Keep response concise (max 80 words recommended)
4. PROFESSIONAL TONE: Use helpful, courteous, human-like tone
5. NO AI MENTIONS: Never say "I'm an AI" or "I'm a chatbot"
6. NO MARKDOWN: Plain text only
7. ACCURACY: Base answers on documents if available
8. NO GUESSING: If unsure, acknowledge it

Provide your response:`;

      const modelInstance = this.genAI.getGenerativeModel({ model: this.model });
      const result = await modelInstance.generateContent(systemPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Response generation error:', error.message);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Clean response of unwanted formatting and AI phrases
   * @param {string} text - Raw response text
   * @returns {string} - Cleaned text
   */
  cleanResponse(text) {
    if (!text) return '';

    let cleaned = text;

    // Remove markdown bold (**text** or *text*)
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');

    // Remove bullet points with asterisks
    cleaned = cleaned.replace(/^\s*[\*\-\+]\s+/gm, '');

    // Remove smart quotes
    cleaned = cleaned.replace(/[""]/g, '');
    cleaned = cleaned.replace(/['']/g, '');

    // Remove markdown headers
    cleaned = cleaned.replace(/^#+\s+/gm, '');

    // Remove markdown links
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

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

    // Remove extra whitespace
    cleaned = cleaned.replace(/\n\s*\n/g, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ');

    return cleaned.trim();
  }

  /**
   * Enforce word limit on response
   * @param {string} text - Response text
   * @param {number} maxWords - Maximum words (default 80)
   * @returns {string} - Truncated text
   */
  enforceWordLimit(text, maxWords = 80) {
    if (!text) return '';

    const words = text.split(/\s+/);
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
  }

  /**
   * Process and validate response
   * @param {string} text - Raw response
   * @param {string} userMessage - Original user message
   * @returns {string} - Final response
   */
  processResponse(text, userMessage) {
    const offTopicMessage = 'I am here to assist you with all queries related to ABS Developers.';

    // Clean markdown and formatting
    let cleaned = this.cleanResponse(text);

    // Check if already off-topic response
    if (cleaned.toLowerCase().includes(offTopicMessage.toLowerCase())) {
      return offTopicMessage;
    }

    // Check if question is off-topic
    const lowerQuery = userMessage.toLowerCase();
    const offTopicKeywords = [
      'poem', 'joke', 'story', 'recipe', 'weather', 'sports', 'movie', 'music', 'game',
      'funny', 'tell me a poem', 'write a poem', 'tell me a joke', 'tell me a story',
      'what is the date', 'what date', 'what time', 'current date', 'today date',
      'what day', 'current time', 'what is today', 'date today', 'time now'
    ];

    const isOffTopic = offTopicKeywords.some(keyword => lowerQuery.includes(keyword));

    if (isOffTopic) {
      return offTopicMessage;
    }

    // Check for AI phrases and redirect if needed
    const aiPhrases = [
      /\bai\b/i,
      /\bartificial intelligence\b/i,
      /\bchatbot\b/i,
      /\bi am an ai\b/i,
      /\bi'm an ai\b/i,
      /\bas an ai\b/i,
      /\bi don't have access\b/i,
      /\bi cannot tell you\b/i,
      /\bi cannot provide\b/i
    ];

    const containsAIPhrase = aiPhrases.some(phrase => phrase.test(cleaned));

    if (containsAIPhrase) {
      // Check if response mentions real estate
      const mentionsRealEstate = /\babs\b/i.test(cleaned) ||
        /\bdeveloper\b/i.test(cleaned) ||
        /\bproperty\b/i.test(cleaned) ||
        /\breal estate\b/i.test(cleaned) ||
        /\bproject\b/i.test(cleaned) ||
        /\bapartment\b/i.test(cleaned) ||
        /\bflat\b/i.test(cleaned) ||
        /\bpayment\b/i.test(cleaned);

      // Only redirect if mentions AI but NOT real estate
      if (!mentionsRealEstate) {
        return offTopicMessage;
      }
    }

    // Enforce word limit
    cleaned = this.enforceWordLimit(cleaned);

    return cleaned.trim();
  }
}

module.exports = ConversationSummarizer;
