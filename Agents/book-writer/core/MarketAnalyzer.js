const fs = require('fs');
const path = require('path');

/**
 * Market Analyzer for Book Writer Agent
 * Analyzes market conditions and opportunities for book publishing
 */
class MarketAnalyzer {
  constructor(config = {}) {
    this.config = {
      defaultCurrency: 'EUR',
      ...config
    };

    this.marketDataDir = path.join(__dirname, '../../../data/market');
    this.publishersDir = path.join(__dirname, '../../../data/publishers');
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [this.marketDataDir, this.publishersDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Perform comprehensive market analysis
   * @param {string} topic - The book topic
   * @param {Object} interviewData - Data from professional interview
   * @returns {Promise<Object>} Comprehensive market analysis
   */
  async performComprehensiveAnalysis(topic, interviewData) {
    console.log(`🔍 Performing comprehensive market analysis for topic: ${topic}`);

    try {
      // Gather market data
      const marketData = await this.gatherMarketData(topic);

      // Analyze competition
      const competitiveAnalysis = await this.analyzeCompetition(topic, marketData);

      // Identify target audience
      const targetAudience = await this.identifyTargetAudience(topic, interviewData);

      // Develop pricing strategy
      const pricingStrategy = await this.developPricingStrategy(interviewData, competitiveAnalysis);

      // Analyze distribution channels
      const distributionChannels = await this.analyzeDistributionChannels(marketData);

      // Calculate monetization potential
      const monetization = this.calculateMonetizationPotential({
        targetAudience,
        pricingStrategy,
        marketData
      });

      // Compile comprehensive analysis
      const analysis = {
        topic: topic,
        competitiveAnalysis: competitiveAnalysis,
        targetAudience: targetAudience,
        pricingStrategy: pricingStrategy,
        distributionChannels: distributionChannels,
        monetization: monetization,
        analyzedAt: new Date().toISOString()
      };

      console.log(`✅ Comprehensive market analysis completed for topic: ${topic}`);
      return analysis;
    } catch (error) {
      console.error(`❌ Failed to perform comprehensive market analysis: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze market opportunities for a book topic
   * @param {string} topic - The book topic
   * @param {Object} interviewData - Data from professional interview
   * @returns {Promise<Object>} Market analysis results
   */
  async analyzeMarketOpportunities(topic, interviewData) {
    console.log(`📈 Analyzing market opportunities for topic: ${topic}`);

    // Gather market data
    const marketData = await this.gatherMarketData(topic);

    // Analyze competition
    const competitionAnalysis = await this.analyzeCompetition(topic, marketData);

    // Evaluate target audience
    const audienceAnalysis = await this.evaluateTargetAudience(topic, interviewData);

    // Assess pricing opportunities
    const pricingAnalysis = await this.assessPricingOpportunities(topic, marketData);

    // Identify distribution channels
    const distributionAnalysis = await this.identifyDistributionChannels(topic);

    // Calculate potential revenue
    const revenueProjections = await this.calculateRevenueProjections(topic, interviewData);

    // Compile market analysis
    const marketAnalysis = {
      topic: topic,
      marketData: marketData,
      competition: competitionAnalysis,
      audience: audienceAnalysis,
      pricing: pricingAnalysis,
      distribution: distributionAnalysis,
      revenueProjections: revenueProjections,
      overallOpportunity: this.calculateOverallOpportunity(
        competitionAnalysis,
        audienceAnalysis,
        pricingAnalysis
      ),
      analyzedAt: new Date().toISOString()
    };

    // Save market analysis
    await this.saveMarketAnalysis(topic, marketAnalysis);

    console.log(`✅ Market analysis completed for topic: ${topic}`);
    return marketAnalysis;
  }

  /**
   * Gather market data for a topic
   */
  async gatherMarketData(topic) {
    console.log(`📊 Gathering market data for topic: ${topic}`);

    // Simulate market data gathering
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate mock market data
    const marketData = {
      topic: topic,
      marketSize: {
        estimatedValue: this.generateRandomValue(1000000, 10000000),
        annualGrowth: (Math.random() * 15).toFixed(2) + '%',
        numberOfTitles: Math.floor(Math.random() * 1000) + 500,
        averagePrice: '€' + (Math.random() * 25 + 15).toFixed(2)
      },
      regionalBreakdown: {
        germany: (Math.random() * 60 + 30).toFixed(1) + '%',
        austria: (Math.random() * 10 + 5).toFixed(1) + '%',
        switzerland: (Math.random() * 8 + 4).toFixed(1) + '%',
        other: (Math.random() * 20 + 5).toFixed(1) + '%'
      },
      formatPreferences: {
        print: (Math.random() * 60 + 30).toFixed(1) + '%',
        ebook: (Math.random() * 50 + 30).toFixed(1) + '%',
        audiobook: (Math.random() * 30 + 10).toFixed(1) + '%'
      },
      seasonalTrends: {
        peakSeason: 'September - November (Back to School)',
        secondaryPeak: 'January - March (New Year Resolutions)',
        slowPeriod: 'July - August (Summer Vacation)'
      },
      gatheredAt: new Date().toISOString()
    };

    console.log(`✅ Market data gathered for topic: ${topic}`);
    return marketData;
  }

  /**
   * Analyze competition for a topic
   */
  async analyzeCompetition(topic, marketData = null) {
    console.log(`⚔️ Analyzing competition for topic: ${topic}`);

    // If no marketData provided, gather it
    if (!marketData) {
      marketData = await this.gatherMarketData(topic);
    }

    // Simulate competition analysis
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock competition analysis
    const competitionAnalysis = {
      directCompetitors: {
        count: Math.floor(Math.random() * 15) + 5,
        bestSellers: Math.floor(Math.random() * 5) + 1,
        averageRating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
        priceRange: '€' + (Math.random() * 15 + 10).toFixed(2) + ' - €' + (Math.random() * 20 + 25).toFixed(2)
      },
      indirectCompetitors: {
        count: Math.floor(Math.random() * 50) + 20,
        relatedTopics: this.generateRelatedTopics(topic),
        contentOverlap: (Math.random() * 40 + 30).toFixed(1) + '%' // 30-70%
      },
      marketSaturation: marketData.marketSize ? this.calculateMarketSaturation(
        marketData.marketSize.numberOfTitles,
        marketData.marketSize.estimatedValue
      ) : { ratio: '0.00', score: 50, level: 'Unknown' },
      competitiveAdvantages: this.identifyCompetitiveAdvantages(topic),
      bestSellers: this.identifyBestSellers(topic),
      marketGap: this.analyzeMarketGap(topic),
      analyzedAt: new Date().toISOString()
    };

    console.log(`✅ Competition analysis completed for topic: ${topic}`);
    return competitionAnalysis;
  }

  /**
   * Identify target audience for a topic
   * @param {string} topic - The book topic
   * @param {Object} interviewData - Data from professional interview
   * @returns {Promise<Object>} Target audience analysis
   */
  async identifyTargetAudience(topic, interviewData) {
    console.log(`👥 Identifying target audience for topic: ${topic}`);

    // Simulate audience identification
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract audience information from interview data
    const audienceType = interviewData?.bookType?.audience || 'General';
    const readingBehavior = interviewData?.bookType?.readingBehavior || 'Mixed';

    // Generate target audience analysis
    const targetAudience = {
      primary: audienceType,
      secondary: this.determineSecondaryAudience(audienceType),
      estimatedSize: this.estimateAudienceSize(audienceType),
      characteristics: {
        ageRange: this.determineAgeRange(audienceType),
        educationLevel: this.determineEducationLevel(audienceType),
        interests: this.identifyInterests(audienceType),
        buyingBehavior: this.analyzeBuyingBehavior(audienceType)
      },
      engagementPreferences: {
        contentFormat: this.determineFormatPreferences(readingBehavior),
        communicationChannels: this.identifyCommunicationChannels(audienceType),
        contentDepth: this.determineDepthPreferences(readingBehavior)
      },
      identifiedAt: new Date().toISOString()
    };

    console.log(`✅ Target audience identified for topic: ${topic}`);
    return targetAudience;
  }

  /**
   * Develop pricing strategy
   * @param {Object} interviewData - Data from professional interview
   * @param {Object} competitionData - Competition analysis data
   * @returns {Promise<Object>} Pricing strategy
   */
  async developPricingStrategy(interviewData, competitionData) {
    console.log(`💰 Developing pricing strategy`);

    // Simulate pricing strategy development
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract relevant data
    const targetPrice = interviewData?.market?.targetPrice || '19.99';
    const avgCompetitionPrice = competitionData?.directCompetitors?.priceRange || '€15.00 - €25.00';

    // Generate pricing strategy
    const pricingStrategy = {
      recommendedPrice: this.calculateRecommendedPrice(targetPrice, avgCompetitionPrice),
      premiumSegment: this.definePremiumSegment(),
      budgetSegment: this.defineBudgetSegment(),
      competitivePosition: this.determineCompetitivePosition(targetPrice, avgCompetitionPrice),
      promotionalOptions: this.suggestPromotionalOptions(),
      pricingModel: this.recommendPricingModel(interviewData),
      developedAt: new Date().toISOString()
    };

    console.log(`✅ Pricing strategy developed`);
    return pricingStrategy;
  }

  /**
   * Analyze distribution channels
   * @param {Object} marketData - Market data
   * @returns {Promise<Object>} Distribution channel analysis
   */
  async analyzeDistributionChannels(marketData) {
    console.log(`📦 Analyzing distribution channels`);

    // Simulate distribution analysis
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract target audience
    const targetAudience = marketData?.targetAudience?.primary || 'General';

    // Generate distribution channel analysis
    const distributionChannels = {
      online: this.identifyOnlineChannels(targetAudience),
      physical: this.identifyPhysicalChannels(targetAudience),
      specialty: this.identifySpecialtyChannels(targetAudience),
      international: this.identifyInternationalOpportunities(targetAudience),
      channelEfficiency: this.estimateChannelEfficiency(),
      costAnalysis: this.analyzeDistributionCosts(),
      analyzedAt: new Date().toISOString()
    };

    console.log(`✅ Distribution channels analyzed`);
    return distributionChannels;
  }

  /**
   * Calculate monetization potential
   * @param {Object} marketAnalysis - Market analysis data
   * @returns {Object} Monetization potential analysis
   */
  calculateMonetizationPotential(marketAnalysis) {
    console.log(`💵 Calculating monetization potential`);

    // Extract relevant data
    const audienceSize = marketAnalysis.targetAudience?.estimatedSize?.estimate || '50000';
    const recommendedPrice = marketAnalysis.pricingStrategy?.recommendedPrice || '19.99';

    // Generate monetization potential analysis
    const monetization = {
      estimatedSales: this.estimateSalesPotential(audienceSize),
      revenuePotential: this.calculateRevenuePotential(audienceSize, recommendedPrice),
      royaltyEstimate: this.estimateRoyaltyEarnings(recommendedPrice),
      breakEvenPoint: this.calculateBreakEvenPoint(),
      additionalRevenueStreams: this.identifyAdditionalRevenueStreams(),
      monetizationAt: new Date().toISOString()
    };

    console.log(`✅ Monetization potential calculated`);
    return monetization;
  }

  /**
   * Evaluate target audience
   */
  async evaluateTargetAudience(topic, interviewData) {
    console.log(`👥 Evaluating target audience for topic: ${topic}`);

    // Simulate audience evaluation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract audience information from interview data
    const audienceType = interviewData?.bookType?.audience || 'General';
    const readingBehavior = interviewData?.bookType?.readingBehavior || 'Mixed';

    // Generate mock audience analysis
    const audienceAnalysis = {
      primaryAudience: audienceType,
      audienceSize: this.estimateAudienceSize(audienceType),
      readingPreferences: {
        format: this.determineFormatPreferences(readingBehavior),
        length: this.determineLengthPreferences(readingBehavior),
        contentDepth: this.determineDepthPreferences(readingBehavior)
      },
      purchasingBehavior: {
        priceSensitivity: this.calculatePriceSensitivity(audienceType),
        preferredRetailers: this.identifyPreferredRetailers(audienceType),
        buyingFrequency: this.estimateBuyingFrequency(audienceType)
      },
      marketingSegments: this.identifyMarketingSegments(audienceType),
      engagementOpportunities: this.identifyEngagementOpportunities(audienceType),
      evaluatedAt: new Date().toISOString()
    };

    console.log(`✅ Target audience evaluation completed for topic: ${topic}`);
    return audienceAnalysis;
  }

  /**
   * Assess pricing opportunities
   */
  async assessPricingOpportunities(topic, marketData) {
    console.log(`💰 Assessing pricing opportunities for topic: ${topic}`);

    // Simulate pricing analysis
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock pricing analysis
    const pricingAnalysis = {
      marketPriceRange: marketData.marketSize.averagePrice,
      optimalPricePoint: this.calculateOptimalPricePoint(marketData),
      priceElasticity: this.estimatePriceElasticity(topic),
      competitorPricing: {
        lowEnd: '€' + (Math.random() * 10 + 5).toFixed(2),
        midRange: '€' + (Math.random() * 15 + 15).toFixed(2),
        highEnd: '€' + (Math.random() * 20 + 30).toFixed(2)
      },
      valueProposition: this.determineValueProposition(topic),
      promotionalPricing: this.suggestPromotionalPricing(),
      pricingStrategy: this.recommendPricingStrategy(topic),
      assessedAt: new Date().toISOString()
    };

    console.log(`✅ Pricing opportunities assessed for topic: ${topic}`);
    return pricingAnalysis;
  }

  /**
   * Identify distribution channels
   */
  async identifyDistributionChannels(topic) {
    console.log(`📦 Identifying distribution channels for topic: ${topic}`);

    // Simulate distribution analysis
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock distribution analysis
    const distributionAnalysis = {
      primaryChannels: [
        'Amazon',
        'Apple Books',
        'Google Play Books'
      ],
      secondaryChannels: [
        'Thalia',
        'Hugendubel',
        'Buchhandlungen'
      ],
      specializedChannels: [
        'Fachverlage',
        'Wissenschaftliche Institutionen',
        'Berufsverbände'
      ],
      digitalOnly: [
        'Kindle Unlimited',
        'Audible',
        'Scribd'
      ],
      internationalOpportunities: [
        'Amazon International',
        'Google Play International',
        'Partnerships with foreign publishers'
      ],
      channelEfficiency: this.estimateChannelEfficiency(),
      distributionCosts: this.estimateDistributionCosts(),
      identifiedAt: new Date().toISOString()
    };

    console.log(`✅ Distribution channels identified for topic: ${topic}`);
    return distributionAnalysis;
  }

  /**
   * Calculate revenue projections
   */
  async calculateRevenueProjections(topic, interviewData) {
    console.log(`💵 Calculating revenue projections for topic: ${topic}`);

    // Simulate revenue calculation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract relevant data from interview
    const targetLength = interviewData?.structure?.length || 'Medium';
    const targetAudience = interviewData?.bookType?.audience || 'General';
    const pricePositioning = interviewData?.market?.pricePositioning || 'Mid-range';

    // Generate mock revenue projections
    const revenueProjections = {
      conservative: {
        firstYear: this.generateRandomValue(5000, 15000),
        secondYear: this.generateRandomValue(3000, 10000),
        thirdYear: this.generateRandomValue(2000, 8000)
      },
      realistic: {
        firstYear: this.generateRandomValue(10000, 25000),
        secondYear: this.generateRandomValue(8000, 20000),
        thirdYear: this.generateRandomValue(6000, 15000)
      },
      optimistic: {
        firstYear: this.generateRandomValue(20000, 50000),
        secondYear: this.generateRandomValue(15000, 40000),
        thirdYear: this.generateRandomValue(12000, 35000)
      },
      keyAssumptions: [
        'Moderate marketing budget',
        'Good content quality',
        'Effective distribution',
        'Positive reviews'
      ],
      breakEvenAnalysis: {
        unitsToBreakEven: Math.floor(Math.random() * 500) + 300,
        timeToBreakEven: Math.floor(Math.random() * 8) + 6 + ' months'
      },
      calculatedAt: new Date().toISOString()
    };

    console.log(`✅ Revenue projections calculated for topic: ${topic}`);
    return revenueProjections;
  }

  // Helper methods

  /**
   * Calculate overall market opportunity score
   */
  calculateOverallOpportunity(competition, audience, pricing) {
    // Simple weighted scoring system
    const competitionScore = 100 - competition.marketSaturation.score; // Invert saturation
    const audienceScore = audience.audienceSize.score;
    const pricingScore = pricing.priceElasticity > 1 ? 80 : 60; // More elastic is better

    // Weighted average (40% competition, 30% audience, 30% pricing)
    const overallScore = (competitionScore * 0.4) + (audienceScore * 0.3) + (pricingScore * 0.3);

    return {
      score: Math.round(overallScore),
      category: overallScore > 80 ? 'Excellent' :
               overallScore > 60 ? 'Good' :
               overallScore > 40 ? 'Fair' : 'Poor',
      recommendation: overallScore > 70 ? 'Proceed with high confidence' :
                     overallScore > 50 ? 'Proceed with caution' :
                     'Consider alternative topics'
    };
  }

  /**
   * Generate random value within range
   */
  generateRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate related topics
   */
  generateRelatedTopics(topic) {
    const related = [
      `Grundlagen von ${topic}`,
      `Praxisanwendung von ${topic}`,
      `Zukunft von ${topic}`,
      `Ethik und ${topic}`,
      `Internationale Perspektiven auf ${topic}`
    ];

    // Return 2-4 random related topics
    const count = Math.floor(Math.random() * 3) + 2;
    return this.shuffleArray(related).slice(0, count);
  }

  /**
   * Shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Calculate market saturation
   */
  calculateMarketSaturation(titleCount, marketValue) {
    // Simple saturation calculation
    const saturationRatio = titleCount / (marketValue / 10000); // Titles per €10k market value
    const score = Math.max(0, Math.min(100, 100 - (saturationRatio * 10)));

    return {
      ratio: saturationRatio.toFixed(2),
      score: Math.round(score),
      level: score > 80 ? 'Low' :
             score > 60 ? 'Moderate' :
             score > 40 ? 'High' : 'Very High'
    };
  }

  /**
   * Identify competitive advantages
   */
  identifyCompetitiveAdvantages(topic) {
    return [
      'Aktuelle und umfassende Research-Daten',
      'Praxisorientierter Ansatz',
      'Interdisziplinäre Perspektive',
      'Zusätzliche Online-Ressourcen',
      'Regelmäßige Updates und Ergänzungen'
    ];
  }

  /**
   * Identify best sellers
   */
  identifyBestSellers(topic) {
    return [
      `Die besten Bücher über ${topic}`,
      `Fachliteratur zu ${topic}`,
      `Praxisleitfaden für ${topic}`
    ];
  }

  /**
   * Analyze market gap
   */
  analyzeMarketGap(topic) {
    return {
      underservedSegments: ['Fachpublikum', 'Praktiker', 'Einsteiger'],
      contentGaps: ['Fallstudien', 'Praxisbeispiele', 'Interaktive Elemente'],
      formatGaps: ['Audiobooks', 'Online-Kurse', 'Mobile Apps']
    };
  }

  /**
   * Determine secondary audience
   */
  determineSecondaryAudience(primaryAudience) {
    const secondary = {
      'Einsteiger': 'Fortgeschrittene',
      'Fortgeschrittene': 'Experten',
      'Experten': 'Einsteiger',
      'Gemischte Zielgruppe': 'Professionals',
      'General': 'Spezialisten'
    };

    return secondary[primaryAudience] || 'Professionals';
  }

  /**
   * Estimate audience size
   */
  estimateAudienceSize(audienceType) {
    const sizes = {
      'Einsteiger': { min: 10000, max: 50000, score: 60 },
      'Fortgeschrittene': { min: 5000, max: 25000, score: 70 },
      'Experten': { min: 1000, max: 10000, score: 80 },
      'Gemischte Zielgruppe': { min: 20000, max: 100000, score: 75 },
      'General': { min: 10000, max: 50000, score: 65 }
    };

    const size = sizes[audienceType] || sizes['General'];
    return {
      estimate: `${this.generateRandomValue(size.min, size.max).toLocaleString()} - ${this.generateRandomValue(size.max, size.max * 2).toLocaleString()}`,
      score: size.score,
      confidence: 'Moderate'
    };
  }

  /**
   * Determine age range
   */
  determineAgeRange(audienceType) {
    const ranges = {
      'Einsteiger': '18-35',
      'Fortgeschrittene': '25-45',
      'Experten': '30-60',
      'Gemischte Zielgruppe': '18-65',
      'General': '20-55'
    };

    return ranges[audienceType] || '25-50';
  }

  /**
   * Determine education level
   */
  determineEducationLevel(audienceType) {
    const levels = {
      'Einsteiger': 'Hochschulabsolventen',
      'Fortgeschrittene': 'Akademiker',
      'Experten': 'Hochschuldozenten/Forscher',
      'Gemischte Zielgruppe': 'Gemischt',
      'General': 'Berufstätige mit Hochschulabschluss'
    };

    return levels[audienceType] || 'Akademiker';
  }

  /**
   * Identify interests
   */
  identifyInterests(audienceType) {
    const interests = {
      'Einsteiger': ['Grundlagen', 'Praxisbeispiele', 'Anleitungen'],
      'Fortgeschrittene': ['Vertiefung', 'Fallstudien', 'Best Practices'],
      'Experten': ['Forschung', 'Innovation', 'Fachdiskussion'],
      'Gemischte Zielgruppe': ['Vielseitigkeit', 'Praxisrelevanz', 'Aktualität'],
      'General': ['Allgemeinverständlichkeit', 'Anwendbarkeit', 'Aktualität']
    };

    return interests[audienceType] || ['Fachwissen', 'Praxisrelevanz'];
  }

  /**
   * Analyze buying behavior
   */
  analyzeBuyingBehavior(audienceType) {
    const behavior = {
      'Einsteiger': 'Preisbewusst, Online-Käufe',
      'Fortgeschrittene': 'Qualitätsorientiert, gemischte Kanäle',
      'Experten': 'Spezialisiert, direkte Verlage',
      'Gemischte Zielgruppe': 'Vielseitig, alle Kanäle',
      'General': 'Gelegenheitskäufe, Online bevorzugt'
    };

    return behavior[audienceType] || 'Gelegenheitskäufe';
  }

  /**
   * Determine format preferences
   */
  determineFormatPreferences(readingBehavior) {
    if (readingBehavior.includes('kurze')) {
      return ['E-Book', 'Audiobook'];
    } else if (readingBehavior.includes('ausführliche')) {
      return ['Print', 'E-Book'];
    } else {
      return ['Print', 'E-Book', 'Audiobook'];
    }
  }

  /**
   * Identify communication channels
   */
  identifyCommunicationChannels(audienceType) {
    const channels = {
      'Einsteiger': ['Social Media', 'YouTube', 'Blogs'],
      'Fortgeschrittene': ['LinkedIn', 'Fachzeitschriften', 'Webinare'],
      'Experten': ['Fachkonferenzen', 'Wissenschaftsnetzwerke', 'Peer-Reviews'],
      'Gemischte Zielgruppe': ['Alle Kanäle', 'Multi-Channel-Ansatz'],
      'General': ['Social Media', 'Newsletter', 'Online-Communities']
    };

    return channels[audienceType] || ['Social Media', 'E-Mail'];
  }

  /**
   * Determine depth preferences
   */
  determineDepthPreferences(readingBehavior) {
    if (readingBehavior.includes('Grundlagen')) {
      return 'Einführend';
    } else if (readingBehavior.includes('ausführliche')) {
      return 'Tiefgehend';
    } else {
      return 'Mittel';
    }
  }

  /**
   * Calculate recommended price
   */
  calculateRecommendedPrice(targetPrice, avgCompetitionPrice) {
    // Simple price calculation
    const target = parseFloat(targetPrice) || 19.99;
    return `€${target.toFixed(2)}`;
  }

  /**
   * Define premium segment
   */
  definePremiumSegment() {
    return {
      priceRange: '€25.00+',
      targetAudience: 'Experten, Premium-Kunden',
      features: ['Erweiterte Inhalte', 'Zusatzmaterialien', 'Persönlicher Support']
    };
  }

  /**
   * Define budget segment
   */
  defineBudgetSegment() {
    return {
      priceRange: '€9.99-14.99',
      targetAudience: 'Einsteiger, Preisbewusste',
      features: ['Kerninhalte', 'Grundlagen', 'Digital-only']
    };
  }

  /**
   * Determine competitive position
   */
  determineCompetitivePosition(targetPrice, avgCompetitionPrice) {
    const target = parseFloat(targetPrice) || 19.99;
    return target > 25 ? 'Premium' :
           target < 15 ? 'Budget' :
           'Mid-range';
  }

  /**
   * Suggest promotional options
   */
  suggestPromotionalOptions() {
    return [
      'Early Bird Rabatte',
      'Bundle-Angebote',
      'Newsletter-Abonnenten-Rabatte',
      'Social Media Gewinnspiele'
    ];
  }

  /**
   * Recommend pricing model
   */
  recommendPricingModel(interviewData) {
    const bookType = interviewData?.bookType?.suggestedFormats?.[0] || 'Sachbuch';
    return bookType.includes('Roman') ? 'Fixed Price' : 'Tiered Pricing';
  }

  /**
   * Identify online channels
   */
  identifyOnlineChannels(targetAudience) {
    return [
      'Amazon',
      'Apple Books',
      'Google Play Books',
      'Kindle Unlimited',
      'Online-Buchhandlungen'
    ];
  }

  /**
   * Identify physical channels
   */
  identifyPhysicalChannels(targetAudience) {
    return [
      'Thalia',
      'Hugendubel',
      'Buchhandlungen',
      'Fachbuchhandlungen'
    ];
  }

  /**
   * Identify specialty channels
   */
  identifySpecialtyChannels(targetAudience) {
    return [
      'Wissenschaftliche Verlage',
      'Universitätsbuchhandlungen',
      'Berufsverbände',
      'Fachkonferenzen'
    ];
  }

  /**
   * Identify international opportunities
   */
  identifyInternationalOpportunities(targetAudience) {
    return [
      'Amazon International',
      'Übersetzungsrechte',
      'Kooperationen mit ausländischen Verlagen'
    ];
  }

  /**
   * Estimate channel efficiency
   */
  estimateChannelEfficiency() {
    return {
      online: 'Hoch (70-90%)',
      physical: 'Mittel (50-70%)',
      specialty: 'Hoch für Nische (80-95%)',
      international: 'Variabel (40-80%)'
    };
  }

  /**
   * Analyze distribution costs
   */
  analyzeDistributionCosts() {
    return {
      online: '5-10% Provision',
      physical: '15-25% Handelsspanne',
      specialty: '10-20% Provision',
      international: '20-30% inkl. Übersetzung'
    };
  }

  /**
   * Estimate sales potential
   */
  estimateSalesPotential(audienceSize) {
    // Extract numeric value from audience size estimate
    const match = audienceSize.match(/(\d+)/);
    const base = match ? parseInt(match[1].replace(/[.,]/g, '')) : 50000;

    // Conservative estimate: 0.5-2% conversion rate
    const minSales = Math.floor(base * 0.005);
    const maxSales = Math.floor(base * 0.02);

    return {
      estimate: `${minSales.toLocaleString()} - ${maxSales.toLocaleString()} Einheiten`,
      confidence: 'Moderate'
    };
  }

  /**
   * Calculate revenue potential
   */
  calculateRevenuePotential(audienceSize, recommendedPrice) {
    // Extract sales potential
    const salesEstimate = this.estimateSalesPotential(audienceSize);
    const match = salesEstimate.estimate.match(/(\d+)/g);
    const minSales = match ? parseInt(match[0].replace(/[.,]/g, '')) : 250;
    const maxSales = match ? parseInt(match[1].replace(/[.,]/g, '')) : 1000;

    // Extract price - handle both string with currency symbol and number
    let price;
    if (typeof recommendedPrice === 'string') {
      price = parseFloat(recommendedPrice.replace('€', '')) || 19.99;
    } else if (typeof recommendedPrice === 'number') {
      price = recommendedPrice;
    } else {
      price = 19.99;
    }

    // Calculate revenue
    const minRevenue = minSales * price;
    const maxRevenue = maxSales * price;

    return {
      estimate: `€${minRevenue.toLocaleString()} - €${maxRevenue.toLocaleString()}`,
      perUnit: `€${price.toFixed(2)}`,
      confidence: 'Moderate'
    };
  }

  /**
   * Estimate royalty earnings
   */
  estimateRoyaltyEarnings(recommendedPrice) {
    // Handle both string with currency symbol and number
    let price;
    if (typeof recommendedPrice === 'string') {
      price = parseFloat(recommendedPrice.replace('€', '')) || 19.99;
    } else if (typeof recommendedPrice === 'number') {
      price = recommendedPrice;
    } else {
      price = 19.99;
    }

    const royaltyRate = 0.10; // 10% standard royalty

    return {
      rate: `${(royaltyRate * 100).toFixed(0)}%`,
      perUnit: `€${(price * royaltyRate).toFixed(2)}`,
      estimate: `€${(price * royaltyRate * 500).toFixed(2)} - €${(price * royaltyRate * 2000).toFixed(2)} (500-2000 Einheiten)`
    };
  }

  /**
   * Calculate break even point
   */
  calculateBreakEvenPoint() {
    const fixedCosts = 5000; // Estimated fixed costs for book production
    const price = 19.99;
    const royaltyRate = 0.10;
    const variableCostPerUnit = price * 0.30; // 30% for printing, distribution, etc.

    const contributionMargin = price - (price * royaltyRate) - variableCostPerUnit;
    const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);

    return {
      units: breakEvenUnits,
      revenue: `€${(breakEvenUnits * price).toLocaleString()}`,
      timeframe: '6-12 Monate',
      assumptions: [
        'Fixkosten: €5.000',
        'Variablen Kosten: 30% des Verkaufspreises',
        'Royalty: 10% des Verkaufspreises'
      ]
    };
  }

  /**
   * Identify additional revenue streams
   */
  identifyAdditionalRevenueStreams() {
    return [
      'Audiobook-Version',
      'Online-Kurs basierend auf dem Buch',
      'Workshops und Vorträge',
      'Zusätzliche Kapitel/Updates als separater Verkauf',
      'Lizenzierung an andere Verlage'
    ];
  }

  /**
   * Calculate price sensitivity
   */
  calculatePriceSensitivity(audienceType) {
    const sensitivity = {
      'Einsteiger': 'High',
      'Fortgeschrittene': 'Medium',
      'Experten': 'Low',
      'Gemischte Zielgruppe': 'Medium',
      'General': 'Medium-High'
    };

    return sensitivity[audienceType] || 'Medium';
  }

  /**
   * Calculate optimal price point
   */
  calculateOptimalPricePoint(marketData) {
    // Extract average price and calculate optimal range
    const avgPrice = parseFloat(marketData.marketSize.averagePrice.replace('€', ''));
    const minPrice = Math.max(5, avgPrice * 0.8);
    const maxPrice = avgPrice * 1.2;

    return '€' + minPrice.toFixed(2) + ' - €' + maxPrice.toFixed(2);
  }

  /**
   * Save market analysis
   */
  async saveMarketAnalysis(topic, analysis) {
    try {
      const filename = `${this.sanitizeFilename(topic)}-market-analysis-${Date.now()}.json`;
      const filepath = path.join(this.marketDataDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(analysis, null, 2));
      console.log(`💾 Market analysis saved: ${filepath}`);

      return filepath;
    } catch (error) {
      console.error(`❌ Failed to save market analysis: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  /**
   * Get market analysis summary
   */
  async getMarketAnalysisSummary(topic) {
    try {
      const files = fs.readdirSync(this.marketDataDir)
        .filter(f => f.startsWith(this.sanitizeFilename(topic)) && f.includes('market-analysis') && f.endsWith('.json'))
        .sort()
        .reverse();

      if (files.length > 0) {
        const latestFile = files[0];
        const filepath = path.join(this.marketDataDir, latestFile);
        const content = fs.readFileSync(filepath, 'utf8');
        const analysis = JSON.parse(content);

        return {
          topic: analysis.topic,
          opportunityScore: analysis.overallOpportunity.score,
          opportunityCategory: analysis.overallOpportunity.category,
          recommendation: analysis.overallOpportunity.recommendation,
          lastAnalyzed: analysis.analyzedAt
        };
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to get market analysis summary: ${error.message}`);
      return null;
    }
  }
}

module.exports = MarketAnalyzer;