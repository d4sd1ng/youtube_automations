const PublisherDatabase = require('../../publishing/PublisherDatabase');

describe('PublisherDatabase', () => {
  let publisherDatabase;

  beforeEach(() => {
    publisherDatabase = new PublisherDatabase();
  });

  describe('getRelevantPublishers', () => {
    it('should get relevant publishers for a genre and market', async () => {
      const genre = 'non-fiction';
      const targetMarket = 'germany';

      const publishers = await publisherDatabase.getRelevantPublishers(genre, targetMarket);

      expect(publishers).toBeDefined();
      expect(Array.isArray(publishers)).toBe(true);
      // Should return some German publishers for non-fiction
      expect(publishers.length).toBeGreaterThan(0);
    });

    it('should get international publishers for global market', async () => {
      const genre = 'fiction';
      const targetMarket = 'global';

      const publishers = await publisherDatabase.getRelevantPublishers(genre, targetMarket);

      expect(publishers).toBeDefined();
      expect(Array.isArray(publishers)).toBe(true);
      // Should return both German and international publishers
      expect(publishers.length).toBeGreaterThan(0);
    });
  });

  describe('getPublisherById', () => {
    it('should get publisher by ID', async () => {
      const publisherId = 'bertelsmann';

      const publisher = await publisherDatabase.getPublisherById(publisherId);

      expect(publisher).toBeDefined();
      expect(publisher.id).toBe(publisherId);
      expect(publisher.name).toBeDefined();
    });

    it('should return null for non-existent publisher', async () => {
      const publisherId = 'non-existent-publisher';

      const publisher = await publisherDatabase.getPublisherById(publisherId);

      expect(publisher).toBeNull();
    });
  });

  describe('addPublisher', () => {
    it('should add new publisher to database', async () => {
      const newPublisher = {
        name: 'Test Publisher',
        website: 'https://test-publisher.com',
        genres: ['fiction', 'non-fiction'],
        contact: {
          email: 'info@test-publisher.com'
        }
      };

      const addedPublisher = await publisherDatabase.addPublisher(newPublisher, 'international');

      expect(addedPublisher).toBeDefined();
      expect(addedPublisher.id).toBeDefined();
      expect(addedPublisher.name).toBe(newPublisher.name);

      // Verify it can be retrieved
      const retrievedPublisher = await publisherDatabase.getPublisherById(addedPublisher.id);
      expect(retrievedPublisher).toBeDefined();
      expect(retrievedPublisher.name).toBe(newPublisher.name);
    });
  });

  describe('updatePublisher', () => {
    it('should update existing publisher', async () => {
      // First add a publisher
      const newPublisher = {
        id: 'update-test',
        name: 'Original Name',
        website: 'https://original.com',
        genres: ['fiction']
      };

      await publisherDatabase.addPublisher(newPublisher, 'international');

      // Then update it
      const updates = { name: 'Updated Name', website: 'https://updated.com' };
      const updatedPublisher = await publisherDatabase.updatePublisher('update-test', updates);

      expect(updatedPublisher).toBeDefined();
      expect(updatedPublisher.name).toBe('Updated Name');
      expect(updatedPublisher.website).toBe('https://updated.com');
    });

    it('should return null when updating non-existent publisher', async () => {
      const updates = { name: 'Updated Name' };
      const result = await publisherDatabase.updatePublisher('non-existent', updates);

      expect(result).toBeNull();
    });
  });

  describe('removePublisher', () => {
    it('should remove publisher from database', async () => {
      // First add a publisher
      const newPublisher = {
        id: 'remove-test',
        name: 'To Be Removed',
        genres: ['test']
      };

      await publisherDatabase.addPublisher(newPublisher, 'international');

      // Verify it exists
      let publisher = await publisherDatabase.getPublisherById('remove-test');
      expect(publisher).toBeDefined();

      // Remove it
      const removed = await publisherDatabase.removePublisher('remove-test');
      expect(removed).toBe(true);

      // Verify it's gone
      publisher = await publisherDatabase.getPublisherById('remove-test');
      expect(publisher).toBeNull();
    });

    it('should return false when removing non-existent publisher', async () => {
      const removed = await publisherDatabase.removePublisher('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('searchPublishers', () => {
    it('should search publishers by name or genre', async () => {
      const query = 'bertelsmann';

      const results = await publisherDatabase.searchPublishers(query);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      // Should find Bertelsmann
      expect(results.some(p => p.name.toLowerCase().includes(query))).toBe(true);
    });

    it('should search publishers by genre', async () => {
      const query = 'fiction';

      const results = await publisherDatabase.searchPublishers(query);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      // Should find publishers that handle fiction
      expect(results.some(p => p.genres.includes(query))).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return publisher database statistics', () => {
      const stats = publisherDatabase.getStats();

      expect(stats).toBeDefined();
      expect(stats.germanPublishers).toBeDefined();
      expect(stats.internationalPublishers).toBeDefined();
      expect(stats.totalPublishers).toBeDefined();
      expect(stats.genres).toBeDefined();
      expect(stats.lastUpdated).toBeDefined();
    });
  });
});