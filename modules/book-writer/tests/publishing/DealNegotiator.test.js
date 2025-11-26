const DealNegotiator = require('../../publishing/DealNegotiator');

describe('DealNegotiator', () => {
  let dealNegotiator;

  beforeEach(() => {
    dealNegotiator = new DealNegotiator();
  });

  describe('negotiate', () => {
    it('should negotiate deal with publisher', async () => {
      const publisher = {
        name: 'Test Publisher',
        contracts: {
          royaltyRate: '10-15%',
          advance: '€5000-20000'
        }
      };

      const book = {
        title: 'Test Book',
        wordCount: 60000,
        researchQuality: 7,
        marketPotential: 8
      };

      const result = await dealNegotiator.negotiate(publisher, book);

      expect(result).toBeDefined();
      expect(result.publisher).toBe(publisher);
      expect(result.book).toBe(book);
      expect(result.timestamp).toBeDefined();
      expect(result.finalOffer).toBeDefined();
      expect(result.negotiationRounds).toBeDefined();
      expect(result.negotiationHistory).toBeDefined();
    });

    it('should handle negotiation failure', async () => {
      // Mock a failure scenario
      jest.spyOn(dealNegotiator, 'simulateNegotiation').mockRejectedValue(new Error('Test error'));

      const publisher = { name: 'Test Publisher' };
      const book = { title: 'Test Book' };

      const result = await dealNegotiator.negotiate(publisher, book);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('calculateBookValue', () => {
    it('should calculate book value based on various factors', () => {
      const book = {
        wordCount: 70000,
        researchQuality: 8,
        marketPotential: 9
      };

      const value = dealNegotiator.calculateBookValue(book);

      expect(value).toBeDefined();
      expect(value.baseValue).toBeDefined();
      expect(value.wordCountValue).toBeDefined();
      expect(value.researchQualityValue).toBeDefined();
      expect(value.marketPotentialValue).toBeDefined();
      expect(value.totalValue).toBeDefined();
      expect(value.valueComponents).toBeDefined();
    });

    it('should handle book with minimal data', () => {
      const book = {};

      const value = dealNegotiator.calculateBookValue(book);

      expect(value).toBeDefined();
      expect(value.totalValue).toBeDefined();
      // Should use default values
    });
  });

  describe('determineInitialOffer', () => {
    it('should determine initial offer based on publisher and book value', () => {
      const publisher = {
        contracts: {
          royaltyRate: '12%',
          advance: '€10000-30000'
        }
      };

      const book = { wordCount: 50000 };
      const bookValue = { totalValue: 60000 };

      const offer = dealNegotiator.determineInitialOffer(publisher, book, bookValue);

      expect(offer).toBeDefined();
      expect(offer.royaltyRate).toBeDefined();
      expect(offer.advance).toBeDefined();
      expect(offer.territory).toBeDefined();
      expect(offer.rights).toBeDefined();
      expect(offer.publicationTimeline).toBeDefined();
    });
  });

  describe('acceptDeal', () => {
    it('should accept deal and mark it as accepted', async () => {
      const dealData = {
        publisher: { name: 'Test Publisher' },
        book: { title: 'Test Book' }
      };

      const acceptedDeal = await dealNegotiator.acceptDeal(dealData);

      expect(acceptedDeal).toBeDefined();
      expect(acceptedDeal.accepted).toBe(true);
      expect(acceptedDeal.status).toBe('accepted');
      expect(acceptedDeal.acceptedAt).toBeDefined();
    });
  });

  describe('rejectDeal', () => {
    it('should reject deal and mark it as rejected', async () => {
      const dealData = {
        publisher: { name: 'Test Publisher' },
        book: { title: 'Test Book' }
      };

      const rejectedDeal = await dealNegotiator.rejectDeal(dealData);

      expect(rejectedDeal).toBeDefined();
      expect(rejectedDeal.accepted).toBe(false);
      expect(rejectedDeal.status).toBe('rejected');
      expect(rejectedDeal.rejectedAt).toBeDefined();
    });
  });

  describe('getBookDeals', () => {
    it('should get all deals for a book', async () => {
      const bookTitle = 'Deal Test Book';

      // Create a test deal
      const dealData = {
        publisher: { id: 'test-pub', name: 'Test Publisher' },
        book: { title: bookTitle }
      };

      await dealNegotiator.saveDealData(dealData);

      // Get deals for the book
      const deals = await dealNegotiator.getBookDeals(bookTitle);

      expect(deals).toBeDefined();
      expect(Array.isArray(deals)).toBe(true);
      // Should find at least one deal
      expect(deals.length).toBeGreaterThan(0);
    });
  });

  describe('getStats', () => {
    it('should return deal negotiation statistics', () => {
      const stats = dealNegotiator.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalDeals).toBeDefined();
      expect(stats.successfulDeals).toBeDefined();
      expect(stats.successRate).toBeDefined();
      expect(stats.totalAdvanceValue).toBeDefined();
      expect(stats.averageAdvance).toBeDefined();
      expect(stats.dataDir).toBeDefined();
    });
  });
});