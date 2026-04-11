// Context Manager - Token counting and context window management
// File: ragBot/server/lib/contextManager.js

class ContextManager {
  constructor(maxTokens = 4000) {
    this.maxTokens = maxTokens;
    this.reservedTokens = 500; // Reserved for response generation
    this.availableTokens = maxTokens - this.reservedTokens; // 3500 tokens available for context
  }

  /**
   * Count approximate tokens in text
   * Using estimation: 1 token ≈ 4 characters
   * This is a rough approximation; for production use tiktoken or similar
   */
  countTokens(text) {
    if (!text) return 0;
    // Characters / 4 + some overhead for word boundaries
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate total tokens used by a batch of messages
   */
  calculateMessageTokens(messages) {
    if (!Array.isArray(messages)) return 0;
    return messages.reduce((total, msg) => {
      const content = msg.content || '';
      return total + this.countTokens(content);
    }, 0);
  }

  /**
   * Check if total tokens fit within available context window
   */
  canFitInContext(totalTokens) {
    return totalTokens <= this.availableTokens;
  }

  /**
   * Build a formatted context string from messages and summaries
   * Includes summaries first (historical context) then recent messages
   */
  buildContextString(messages = [], summaries = []) {
    let context = '';

    // Add summarized context first (older messages)
    if (summaries.length > 0) {
      context += '=== CONVERSATION HISTORY SUMMARY ===\n\n';
      for (const summary of summaries) {
        context += `[SUMMARIZED - ${summary.message_count} messages]\n`;
        context += `${summary.summary}\n\n`;
      }
      context += '=== RECENT CONVERSATION ===\n\n';
    }

    // Add recent messages in full
    if (messages.length > 0) {
      for (const msg of messages) {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        context += `${role}: ${msg.content}\n\n`;
      }
    }

    return context.trim();
  }

  /**
   * Get number of tokens available for context
   */
  getAvailableTokens(currentUsedTokens) {
    return Math.max(0, this.availableTokens - currentUsedTokens);
  }

  /**
   * Determine if summarization should be triggered
   * Trigger at 80% of available tokens
   */
  shouldSummarize(totalTokens) {
    const threshold = this.availableTokens * 0.8; // 2800 tokens
    return totalTokens >= threshold;
  }

  /**
   * Get summary of token usage
   */
  getTokenUsageSummary(totalTokens) {
    const percentUsed = (totalTokens / this.availableTokens) * 100;
    return {
      used: totalTokens,
      available: this.availableTokens,
      percentUsed: Math.round(percentUsed),
      shouldSummarize: this.shouldSummarize(totalTokens),
      spacingMetrics: {
        80: this.availableTokens * 0.8,
        90: this.availableTokens * 0.9,
        100: this.availableTokens
      }
    };
  }

  /**
   * Determine which messages should be kept vs summarized
   * Keep recent messages in full, summarize older ones
   */
  determineMessagesToSummarize(messages, targetTokens = 1500) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return { toKeep: [], toSummarize: [] };
    }

    const currentTokens = this.calculateMessageTokens(messages);

    if (!this.shouldSummarize(currentTokens)) {
      return { toKeep: messages, toSummarize: [] };
    }

    // Calculate how many tokens we need to free up
    const tokensToFree = currentTokens - targetTokens;
    let tokensFreed = 0;
    let splitIndex = 0;

    // Find split point: older messages to summarize
    for (let i = 0; i < messages.length; i++) {
      const msgTokens = this.countTokens(messages[i].content);
      tokensFreed += msgTokens;

      if (tokensFreed >= tokensToFree) {
        splitIndex = i + 1;
        break;
      }
    }

    return {
      toSummarize: messages.slice(0, splitIndex),
      toKeep: messages.slice(splitIndex)
    };
  }
}

module.exports = ContextManager;
