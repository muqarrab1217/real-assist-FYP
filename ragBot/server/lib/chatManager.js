// Chat Manager - Database operations for chat sessions and messages
// File: ragBot/server/lib/chatManager.js

const { createClient } = require('@supabase/supabase-js');

class ChatManager {
  constructor(supabaseUrl, supabaseKey) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key are required');
    }
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new chat session
   * @param {string} userId - User ID (from auth)
   * @param {string} title - Chat title (optional, defaulted to 'New Chat')
   * @param {string} description - Chat description (optional)
   * @returns {Promise<Object>} - Created chat session
   */
  async createChatSession(userId, title = 'New Chat', description = null) {
    try {
      const { data, error } = await this.supabase
        .from('chat_sessions')
        .insert([{
          user_id: userId,
          title,
          description,
          total_messages: 0,
          is_summarized: false
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error creating chat:', error);
        throw error;
      }

      console.log(`Created chat session: ${data.id} for user: ${userId}`);
      return data;
    } catch (error) {
      throw new Error(`Failed to create chat: ${error.message}`);
    }
  }

  /**
   * Get all chat sessions for a user
   * @param {string} userId - User ID
   * @param {number} limit - Results limit (default 20)
   * @param {number} offset - Results offset (default 0)
   * @returns {Promise<Object>} - Chat sessions with pagination info
   */
  async getUserChats(userId, limit = 20, offset = 0) {
    try {
      // Get chat sessions
      const { data, error, count } = await this.supabase
        .from('chat_sessions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Database error fetching chats:', error);
        throw error;
      }

      // Get message counts for each chat
      const chatsWithCounts = await Promise.all(
        (data || []).map(async (chat) => {
          const { count: messageCount } = await this.supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id);

          return {
            ...chat,
            message_count: messageCount || 0
          };
        })
      );

      return {
        chats: chatsWithCounts,
        total: count || 0,
        limit,
        offset,
        hasMore: offset + limit < (count || 0)
      };
    } catch (error) {
      throw new Error(`Failed to fetch chats: ${error.message}`);
    }
  }

  /**
   * Get a specific chat and its messages
   * @param {string} chatId - Chat session ID
   * @param {string} userId - User ID (for verification)
   * @param {number} limit - Messages limit (default 50)
   * @param {number} offset - Messages offset (default 0)
   * @returns {Promise<Object>} - Chat with messages and pagination
   */
  async getChatMessages(chatId, userId, limit = 50, offset = 0) {
    try {
      // Verify ownership
      const { data: chatData, error: chatError } = await this.supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', chatId)
        .eq('user_id', userId)
        .single();

      if (chatError || !chatData) {
        throw new Error('Chat not found or unauthorized');
      }

      // Get messages
      const { data: messages, error: msgError, count } = await this.supabase
        .from('chat_messages')
        .select('*', { count: 'exact' })
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (msgError) {
        console.error('Database error fetching messages:', msgError);
        throw msgError;
      }

      // Get latest summary if exists
      const { data: summaries } = await this.supabase
        .from('context_summaries')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(1);

      const summary = summaries && summaries.length > 0 ? summaries[0].summary : null;

      return {
        chat: chatData,
        messages: messages || [],
        summary,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: offset + limit < (count || 0)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  }

  /**
   * Save a pair of messages (user + assistant)
   * @param {string} chatId - Chat session ID
   * @param {string} userMessage - User message text
   * @param {string} assistantMessage - Assistant response text
   * @param {number} userTokens - Tokens in user message
   * @param {number} assistantTokens - Tokens in assistant response
   * @returns {Promise<Array>} - Inserted messages
   */
  async saveMessagePair(chatId, userMessage, assistantMessage, userTokens = 0, assistantTokens = 0) {
    try {
      // Insert both messages
      const { data, error } = await this.supabase
        .from('chat_messages')
        .insert([
          {
            chat_id: chatId,
            role: 'user',
            content: userMessage,
            token_count: userTokens
          },
          {
            chat_id: chatId,
            role: 'assistant',
            content: assistantMessage,
            token_count: assistantTokens
          }
        ])
        .select();

      if (error) {
        console.error('Database error saving messages:', error);
        throw error;
      }

      // Update chat metadata
      const messageCount = (data || []).length;
      const totalTokens = userTokens + assistantTokens;

      const { error: updateError } = await this.supabase
        .from('chat_sessions')
        .update({
          total_messages: this.supabase.rpc(
            'increment_message_count',
            { chat_id: chatId, increment: messageCount }
          ),
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId);

      if (updateError && !updateError.message.includes('does not exist')) {
        // RPC might not exist, try simple update instead
        await this.supabase
          .from('chat_sessions')
          .update({
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', chatId);
      }

      console.log(`Saved message pair to chat ${chatId}`);
      return data;
    } catch (error) {
      throw new Error(`Failed to save messages: ${error.message}`);
    }
  }

  /**
   * Save a conversation summary
   * @param {string} chatId - Chat session ID
   * @param {string} summary - Summary text
   * @param {number} messageCount - Number of messages summarized
   * @param {number} originalTokens - Tokens in original messages
   * @param {number} summaryTokens - Tokens in summary
   * @param {string} firstMsgId - ID of first summarized message
   * @param {string} lastMsgId - ID of last summarized message
   * @returns {Promise<Object>} - Created summary record
   */
  async saveSummary(chatId, summary, messageCount, originalTokens = 0, summaryTokens = 0, firstMsgId = null, lastMsgId = null) {
    try {
      // Insert summary
      const { data, error } = await this.supabase
        .from('context_summaries')
        .insert([{
          chat_id: chatId,
          summary,
          message_count: messageCount,
          original_token_count: originalTokens,
          summary_token_count: summaryTokens,
          first_message_id: firstMsgId,
          last_message_id: lastMsgId
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error saving summary:', error);
        throw error;
      }

      // Mark messages as summarized
      if (lastMsgId) {
        await this.supabase
          .from('chat_messages')
          .update({ is_summarized: true })
          .eq('chat_id', chatId)
          .lte('created_at', new Date().toISOString());
      }

      // Update chat status
      await this.supabase
        .from('chat_sessions')
        .update({ is_summarized: true })
        .eq('id', chatId);

      console.log(`Saved summary for chat ${chatId}`);
      return data;
    } catch (error) {
      throw new Error(`Failed to save summary: ${error.message}`);
    }
  }

  /**
   * Soft delete a chat session
   * @param {string} chatId - Chat session ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<boolean>} - Success status
   */
  async deleteChat(chatId, userId) {
    try {
      const { error } = await this.supabase
        .from('chat_sessions')
        .update({ status: 'deleted' })
        .eq('id', chatId)
        .eq('user_id', userId);

      if (error) {
        console.error('Database error deleting chat:', error);
        throw error;
      }

      console.log(`Deleted chat ${chatId} for user ${userId}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete chat: ${error.message}`);
    }
  }

  /**
   * Update chat title
   * @param {string} chatId - Chat session ID
   * @param {string} userId - User ID (for verification)
   * @param {string} newTitle - New title
   * @returns {Promise<Object>} - Updated chat
   */
  async updateChatTitle(chatId, userId, newTitle) {
    try {
      const { data, error } = await this.supabase
        .from('chat_sessions')
        .update({
          title: newTitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Database error updating title:', error);
        throw error;
      }

      console.log(`Updated chat ${chatId} title to: ${newTitle}`);
      return data;
    } catch (error) {
      throw new Error(`Failed to update title: ${error.message}`);
    }
  }

  /**
   * Get recent messages for context (last N messages)
   * @param {string} chatId - Chat session ID
   * @param {number} limit - Number of recent messages (default 20)
   * @returns {Promise<Array>} - Recent messages
   */
  async getRecentMessages(chatId, limit = 20) {
    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Database error fetching recent messages:', error);
        throw error;
      }

      // Reverse to get chronological order
      return (data || []).reverse();
    } catch (error) {
      throw new Error(`Failed to fetch recent messages: ${error.message}`);
    }
  }

  /**
   * Get summaries for a chat
   * @param {string} chatId - Chat session ID
   * @returns {Promise<Array>} - Summary records
   */
  async getChatSummaries(chatId) {
    try {
      const { data, error } = await this.supabase
        .from('context_summaries')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error fetching summaries:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch summaries: ${error.message}`);
    }
  }

  /**
   * Log AI interaction to ai_logs
   * @param {string} userId - User ID
   * @param {string} chatId - Chat ID
   * @param {Object} input - Input data
   * @param {Object} output - Output data
   * @param {string} status - Log status
   * @returns {Promise<Object>} - Created log entry
   */
  async logAIInteraction(userId, chatId, input, output, status = 'success') {
    try {
      const { data, error } = await this.supabase
        .from('ai_logs')
        .insert([{
          user_id: userId,
          chat_id: chatId,
          input_data: input,
          output_data: output,
          status: status
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error logging interaction:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Failed to log AI interaction: ${error.message}`);
      // Don't throw, logging shouldn't break the flow
      return null;
    }
  }
}

module.exports = ChatManager;
