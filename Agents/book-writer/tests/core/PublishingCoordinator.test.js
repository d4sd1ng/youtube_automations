const PublishingCoordinator = require('../../core/PublishingCoordinator');

describe('PublishingCoordinator', () => {
  let publishingCoordinator;

  beforeEach(() => {
    publishingCoordinator = new PublishingCoordinator();
  });

  describe('publishToMultiplePublishers', () => {
    it('should coordinate publishing to multiple publishers', async () => {
      const finalBook = {
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Sachbuch',
        targetMarket: 'germany'
      };

      // Mock the internal methods to avoid actual publishing
      jest.spyOn(publishingCoordinator, 'identifyPublishers').mockResolvedValue([
        { id: 'test-publisher-1', name: 'Test Publisher 1' },
        { id: 'test-publisher-2', name: 'Test Publisher 2' }
      ]);

      jest.spyOn(publishingCoordinator.dealNegotiator, 'negotiate').mockResolvedValue({
        success: true,
        publisher: { name: 'Test Publisher 1' },
        finalOffer: { royaltyRate: 0.12, advance: 5000 }
      });

      jest.spyOn(publishingCoordinator, 'publishToAmazon').mockResolvedValue({
        success: true,
        asin: 'B0123456789'
      });

      const result = await publishingCoordinator.publishToMultiplePublishers(finalBook);

      expect(result).toBeDefined();
      expect(result.publisherDeals).toBeDefined();
      expect(result.amazonListing).toBeDefined();
      expect(Array.isArray(result.publisherDeals)).toBe(true);
    }, 10000); // Longer timeout for publishing coordination
  });

  describe('identifyPublishers', () => {
    it('should identify relevant publishers', async () => {
      const genre = 'Sachbuch';
      const targetMarket = 'germany';

      const result = await publishingCoordinator.identifyPublishers(genre, targetMarket);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Should return some publishers
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('negotiateWithPublishers', () => {
    it('should negotiate with publishers', async () => {
      const publishers = [
        { id: 'test-pub-1', name: 'Test Publisher 1' },
        { id: 'test-pub-2', name: 'Test Publisher 2' }
      ];
      const book = { title: 'Test Book' };

      // Mock the deal negotiator
      jest.spyOn(publishingCoordinator.dealNegotiator, 'negotiate').mockResolvedValue({
        success: true,
        publisher: { name: 'Test Publisher 1' },
        finalOffer: { royaltyRate: 0.12, advance: 5000 }
      });

      const result = await publishingCoordinator.negotiateWithPublishers(publishers, book);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Should have attempted negotiations
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('publishToAmazon', () => {
    it('should publish book to Amazon KDP', async () => {
      const book = {
        title: 'Amazon Test Book',
        author: 'Test Author'
      };

      // Mock the Amazon integration
      jest.spyOn(publishingCoordinator, 'prepareAmazonSubmission').mockResolvedValue({
        title: book.title,
        author: book.author,
        description: 'Test description'
      });

      const result = await publishingCoordinator.publishToAmazon(book);

      expect(result).toBeDefined();
      // In a real implementation, this would have more detailed results
    });
  });

  describe('prepareAmazonSubmission', () => {
    it('should prepare book for Amazon submission', async () => {
      const book = {
        title: 'Preparation Test Book',
        author: 'Test Author',
        description: 'Test description',
        formattedBook: {
          pdf: { fileSize: 1024 },
          epub: { fileSize: 512 }
        }
      };

      const result = await publishingCoordinator.prepareAmazonSubmission(book);

      expect(result).toBeDefined();
      expect(result.title).toBe(book.title);
      expect(result.author).toBe(book.author);
      expect(result.description).toBe(book.description);
      expect(result.formats).toBeDefined();
    });
  });

  describe('createPublicationReport', () => {
    it('should create a publication report', () => {
      const deals = [
        { success: true, publisher: { name: 'Publisher 1' }, finalOffer: { advance: 5000 } }
      ];
      const amazonResult = { success: true, asin: 'B0123456789' };

      const result = publishingCoordinator.createPublicationReport(deals, amazonResult);

      expect(result).toBeDefined();
      expect(result.totalDeals).toBe(1);
      expect(result.successfulDeals).toBe(1);
      expect(result.amazonListing).toBeDefined();
      expect(result.summary).toBeDefined();
    });
  });
});