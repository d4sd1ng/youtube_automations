const fs = require('fs');
const path = require('path');

/**
 * Deal Negotiator for Book Writer Agent
 * Handles negotiation of publishing deals with publishers
 */
class DealNegotiator {
  constructor(config = {}) {
    this.config = {
      dataDir: path.join(__dirname, '../../../data/publishing/deals'),
      defaultRoyaltyRate: 0.12, // 12%
      defaultAdvance: 10000, // €10,000
      negotiationTimeout: 300000, // 5 minutes
      ...config
    };

    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.config.dataDir)) {
      fs.mkdirSync(this.config.dataDir, { recursive: true });
    }
  }

  /**
   * Negotiate deal with publisher
   * @param {Object} publisher - Publisher data
   * @param {Object} book - Book data
   * @returns {Promise<Object>} Negotiation result
   */
  async negotiate(publisher, book) {
    console.log(`🤝 Negotiating deal with ${publisher.name} for "${book.title}"`);

    try {
      // Prepare negotiation data
      const negotiationData = this.prepareNegotiationData(publisher, book);

      // Simulate negotiation process
      const negotiationResult = await this.simulateNegotiation(negotiationData);

      // Save deal data
      await this.saveDealData(negotiationResult);

      console.log(`✅ Negotiation completed with ${publisher.name}: ${negotiationResult.success ? 'SUCCESS' : 'FAILED'}`);
      return negotiationResult;
    } catch (error) {
      console.error(`❌ Failed to negotiate with ${publisher.name}:`, error.message);
      return {
        success: false,
        publisher: publisher,
        book: book,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Prepare negotiation data
   */
  prepareNegotiationData(publisher, book) {
    // Calculate book value metrics
    const bookValue = this.calculateBookValue(book);

    // Determine initial offer based on publisher preferences and book value
    const initialOffer = this.determineInitialOffer(publisher, book, bookValue);

    return {
      publisher: publisher,
      book: book,
      bookValue: bookValue,
      initialOffer: initialOffer,
      negotiationRound: 1
    };
  }

  /**
   * Calculate book value based on various factors
   */
  calculateBookValue(book) {
    // Simple book value calculation based on:
    // - Word count (longer books = more value)
    // - Research quality (if available)
    // - Market potential
    // - Author platform (if available)

    const baseValue = 5000; // Base value in EUR
    const wordCountValue = (book.wordCount || 50000) * 0.1; // 0.1 EUR per word
    const researchQualityValue = (book.researchQuality || 5) * 1000; // 1000 EUR per quality point
    const marketPotentialValue = (book.marketPotential || 5) * 2000; // 2000 EUR per potential point

    const totalValue = baseValue + wordCountValue + researchQualityValue + marketPotentialValue;

    return {
      baseValue: baseValue,
      wordCountValue: wordCountValue,
      researchQualityValue: researchQualityValue,
      marketPotentialValue: marketPotentialValue,
      totalValue: totalValue,
      valueComponents: {
        wordCount: book.wordCount || 50000,
        researchQuality: book.researchQuality || 5,
        marketPotential: book.marketPotential || 5
      }
    };
  }

  /**
   * Determine initial offer based on publisher and book
   */
  determineInitialOffer(publisher, book, bookValue) {
    // Start with publisher's default terms
    const royaltyRate = publisher.contracts?.royaltyRate || this.config.defaultRoyaltyRate;
    const advance = publisher.contracts?.advance || this.config.defaultAdvance;

    // Adjust based on book value
    const valueMultiplier = Math.min(2.0, Math.max(0.5, bookValue.totalValue / 50000)); // Normalize around 50k base value

    // Calculate adjusted offer
    let adjustedAdvance = typeof advance === 'string'
      ? this.parseCurrencyRange(advance)
      : advance;

    if (typeof adjustedAdvance === 'object') {
      adjustedAdvance = (adjustedAdvance.min + adjustedAdvance.max) / 2; // Take average
    }

    adjustedAdvance = adjustedAdvance * valueMultiplier;

    return {
      royaltyRate: royaltyRate,
      advance: adjustedAdvance,
      territory: 'worldwide',
      rights: ['print', 'digital', 'audio'],
      publicationTimeline: '12-18 months'
    };
  }

  /**
   * Parse currency range string (e.g., "€5000-50000")
   */
  parseCurrencyRange(rangeString) {
    try {
      // Remove currency symbols
      const cleaned = rangeString.replace(/[€$£¥]/g, '').trim();

      // Split by dash
      const parts = cleaned.split('-');

      if (parts.length === 2) {
        return {
          min: parseFloat(parts[0].trim()),
          max: parseFloat(parts[1].trim())
        };
      } else {
        return parseFloat(parts[0]);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to parse currency range: ${rangeString}`, error.message);
      return this.config.defaultAdvance;
    }
  }

  /**
   * Simulate negotiation process
   */
  async simulateNegotiation(negotiationData) {
    console.log(`🔄 Simulating negotiation with ${negotiationData.publisher.name}`);

    // Simulate negotiation time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate negotiation rounds
    let currentOffer = { ...negotiationData.initialOffer };
    let round = 1;
    const maxRounds = 3;
    const negotiationHistory = [currentOffer];

    while (round <= maxRounds) {
      // Simulate counter-offer
      const counterOffer = this.generateCounterOffer(currentOffer, negotiationData, round);
      negotiationHistory.push(counterOffer);

      // Check if agreement is reached
      if (this.isAgreementReached(currentOffer, counterOffer)) {
        currentOffer = counterOffer;
        break;
      }

      // Update offer for next round
      currentOffer = counterOffer;
      round++;
    }

    // Determine negotiation outcome
    const success = round <= maxRounds;

    return {
      success: success,
      publisher: negotiationData.publisher,
      book: negotiationData.book,
      finalOffer: currentOffer,
      negotiationRounds: round,
      negotiationHistory: negotiationHistory,
      agreementReached: success,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate counter-offer
   */
  generateCounterOffer(currentOffer, negotiationData, round) {
    // In a real implementation, this would involve more sophisticated logic
    // For simulation, we'll make simple adjustments

    // Adjust royalty rate (0.5-1.5% changes)
    const royaltyAdjustment = (Math.random() * 0.01) - 0.005;
    const newRoyaltyRate = Math.min(0.20, Math.max(0.05, // Keep within reasonable bounds
      parseFloat(currentOffer.royaltyRate) + royaltyAdjustment));

    // Adjust advance based on round (publisher may increase or decrease)
    const advanceAdjustmentFactor = round === 1 ? 1.1 : round === 2 ? 0.95 : 1.02;
    const advanceValue = typeof currentOffer.advance === 'object'
      ? currentOffer.advance.value || currentOffer.advance
      : currentOffer.advance;

    const newAdvance = Math.max(1000, advanceValue * advanceAdjustmentFactor); // Minimum 1000

    return {
      royaltyRate: newRoyaltyRate.toFixed(4),
      advance: newAdvance,
      territory: currentOffer.territory,
      rights: [...currentOffer.rights],
      publicationTimeline: currentOffer.publicationTimeline
    };
  }

  /**
   * Check if agreement is reached
   */
  isAgreementReached(offer1, offer2) {
    // Simple agreement logic: if changes are minimal, consider it agreement
    const royaltyDiff = Math.abs(parseFloat(offer1.royaltyRate) - parseFloat(offer2.royaltyRate));
    const advanceDiff = Math.abs(offer1.advance - offer2.advance);
    const advanceAvg = (offer1.advance + offer2.advance) / 2;

    // Agreement if:
    // - Royalty difference is less than 0.25%
    // - Advance difference is less than 5% of average
    return royaltyDiff < 0.0025 && (advanceAvg === 0 || advanceDiff / advanceAvg < 0.05);
  }

  /**
   * Accept deal
   * @param {Object} dealData - Deal data to accept
   * @returns {Promise<Object>} Acceptance result
   */
  async acceptDeal(dealData) {
    console.log(`✅ Accepting deal with ${dealData.publisher.name}`);

    try {
      // Mark deal as accepted
      const acceptedDeal = {
        ...dealData,
        accepted: true,
        acceptedAt: new Date().toISOString(),
        status: 'accepted'
      };

      // Save updated deal data
      await this.saveDealData(acceptedDeal);

      console.log(`✅ Deal accepted with ${dealData.publisher.name}`);
      return acceptedDeal;
    } catch (error) {
      console.error('❌ Failed to accept deal:', error.message);
      throw error;
    }
  }

  /**
   * Reject deal
   * @param {Object} dealData - Deal data to reject
   * @returns {Promise<Object>} Rejection result
   */
  async rejectDeal(dealData) {
    console.log(`❌ Rejecting deal with ${dealData.publisher.name}`);

    try {
      // Mark deal as rejected
      const rejectedDeal = {
        ...dealData,
        accepted: false,
        rejectedAt: new Date().toISOString(),
        status: 'rejected'
      };

      // Save updated deal data
      await this.saveDealData(rejectedDeal);

      console.log(`✅ Deal rejected with ${dealData.publisher.name}`);
      return rejectedDeal;
    } catch (error) {
      console.error('❌ Failed to reject deal:', error.message);
      throw error;
    }
  }

  /**
   * Save deal data
   */
  async saveDealData(dealData) {
    try {
      const filename = `deal-${dealData.publisher.id}-${this.sanitizeFilename(dealData.book.title)}-${Date.now()}.json`;
      const filepath = path.join(this.config.dataDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(dealData, null, 2));
      console.log(`💾 Deal data saved: ${filepath}`);
    } catch (error) {
      console.error('❌ Failed to save deal data:', error.message);
    }
  }

  /**
   * Load deal data
   */
  async loadDealData(publisherId, bookTitle) {
    try {
      const files = fs.readdirSync(this.config.dataDir)
        .filter(f => f.startsWith(`deal-${publisherId}-${this.sanitizeFilename(bookTitle)}`) && f.endsWith('.json'))
        .sort()
        .reverse(); // Get most recent

      if (files.length > 0) {
        const filepath = path.join(this.config.dataDir, files[0]);
        const content = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to load deal data:', error.message);
      return null;
    }
  }

  /**
   * Get all deals for a book
   */
  async getBookDeals(bookTitle) {
    try {
      const sanitizedTitle = this.sanitizeFilename(bookTitle);
      const files = fs.readdirSync(this.config.dataDir)
        .filter(f => f.includes(sanitizedTitle) && f.endsWith('.json'));

      const deals = [];
      for (const file of files) {
        try {
          const filepath = path.join(this.config.dataDir, file);
          const content = fs.readFileSync(filepath, 'utf8');
          deals.push(JSON.parse(content));
        } catch (error) {
          console.warn(`⚠️ Failed to parse deal file: ${file}`);
        }
      }

      return deals;
    } catch (error) {
      console.error('❌ Failed to get book deals:', error.message);
      return [];
    }
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  /**
   * Get deal negotiation statistics
   */
  getStats() {
    try {
      const files = fs.readdirSync(this.config.dataDir)
        .filter(f => f.startsWith('deal-') && f.endsWith('.json'));

      let totalDeals = 0;
      let successfulDeals = 0;
      let totalAdvance = 0;

      for (const file of files) {
        try {
          const filepath = path.join(this.config.dataDir, file);
          const content = fs.readFileSync(filepath, 'utf8');
          const deal = JSON.parse(content);

          totalDeals++;
          if (deal.success || deal.accepted) {
            successfulDeals++;
            totalAdvance += deal.finalOffer?.advance || deal.advance || 0;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to parse deal file for stats: ${file}`);
        }
      }

      return {
        totalDeals,
        successfulDeals,
        successRate: totalDeals > 0 ? (successfulDeals / totalDeals) : 0,
        totalAdvanceValue: totalAdvance,
        averageAdvance: successfulDeals > 0 ? (totalAdvance / successfulDeals) : 0,
        dataDir: this.config.dataDir
      };
    } catch (error) {
      console.error('❌ Failed to get deal negotiation stats:', error.message);
      return { error: error.message };
    }
  }
}

module.exports = DealNegotiator;