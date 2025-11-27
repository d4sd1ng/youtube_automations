const MarketAnalyzer = require('../../core/MarketAnalyzer');

describe('MarketAnalyzer', () => {
  let marketAnalyzer;

  beforeEach(() => {
    marketAnalyzer = new MarketAnalyzer();
  });

  describe('performComprehensiveAnalysis', () => {
    it('should perform comprehensive market analysis', async () => {
      const topic = 'Künstliche Intelligenz und Gesellschaft';
      const interviewData = {
        bookType: { suggestedFormats: ['Sachbuch'] },
        market: { targetPrice: '19.99' }
      };

      const result = await marketAnalyzer.performComprehensiveAnalysis(topic, interviewData);

      expect(result).toBeDefined();
      expect(result.topic).toBe(topic);
      expect(result.competitiveAnalysis).toBeDefined();
      expect(result.targetAudience).toBeDefined();
      expect(result.pricingStrategy).toBeDefined();
      expect(result.distributionChannels).toBeDefined();
      expect(result.monetization).toBeDefined();
      expect(result.analyzedAt).toBeDefined();
    });

    it('should handle different book types in analysis', async () => {
      const topic = 'Fiction Story';
      const interviewData = {
        bookType: { suggestedFormats: ['Roman'] },
        market: { targetPrice: '14.99' }
      };

      const result = await marketAnalyzer.performComprehensiveAnalysis(topic, interviewData);

      expect(result.pricingStrategy).toBeDefined();
      expect(result.distributionChannels).toBeDefined();
    });
  });

  describe('analyzeCompetition', () => {
    it('should analyze competition for a topic', async () => {
      const topic = 'Politik und Medien';

      const result = await marketAnalyzer.analyzeCompetition(topic);

      expect(result).toBeDefined();
      expect(result.directCompetitors).toBeDefined();
      expect(result.indirectCompetitors).toBeDefined();
      expect(result.bestSellers).toBeDefined();
      expect(result.marketGap).toBeDefined();
    });
  });

  describe('identifyTargetAudience', () => {
    it('should identify target audience for a topic', async () => {
      const topic = 'Technologie und Bildung';
      const interviewData = {
        bookType: { suggestedFormats: ['Lehrbuch'] }
      };

      const result = await marketAnalyzer.identifyTargetAudience(topic, interviewData);

      expect(result).toBeDefined();
      expect(result.primary).toBeDefined();
      expect(result.secondary).toBeDefined();
      expect(result.estimatedSize).toBeDefined();
      expect(result.characteristics).toBeDefined();
    });
  });

  describe('developPricingStrategy', () => {
    it('should develop pricing strategy', async () => {
      const interviewData = {
        bookType: { suggestedFormats: ['Sachbuch'] },
        market: { targetPrice: '24.99' }
      };
      const competitionData = {
        directCompetitors: 15,
        averagePrice: 22.99
      };

      const result = await marketAnalyzer.developPricingStrategy(interviewData, competitionData);

      expect(result).toBeDefined();
      expect(result.recommendedPrice).toBeDefined();
      expect(result.premiumSegment).toBeDefined();
      expect(result.budgetSegment).toBeDefined();
      expect(result.competitivePosition).toBeDefined();
    });
  });

  describe('analyzeDistributionChannels', () => {
    it('should analyze distribution channels', async () => {
      const marketData = {
        targetAudience: { primary: 'Professionals' }
      };

      const result = await marketAnalyzer.analyzeDistributionChannels(marketData);

      expect(result).toBeDefined();
      expect(result.online).toBeDefined();
      expect(result.physical).toBeDefined();
      expect(result.specialty).toBeDefined();
    });
  });

  describe('calculateMonetizationPotential', () => {
    it('should calculate monetization potential', () => {
      const marketData = {
        targetAudience: { estimatedSize: 50000 },
        pricingStrategy: { recommendedPrice: 19.99 }
      };

      const result = marketAnalyzer.calculateMonetizationPotential(marketData);

      expect(result).toBeDefined();
      expect(result.estimatedSales).toBeDefined();
      expect(result.revenuePotential).toBeDefined();
      expect(result.royaltyEstimate).toBeDefined();
      expect(result.breakEvenPoint).toBeDefined();
    });
  });
});