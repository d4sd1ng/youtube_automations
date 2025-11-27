const fs = require('fs');
const path = require('path');

/**
 * Publisher Database for Book Writer Agent
 * Manages database of publishers and publishing information
 */
class PublisherDatabase {
  constructor(config = {}) {
    this.config = {
      dataDir: path.join(__dirname, '../../../data/publishers'),
      germanPublishersFile: 'german_publishers.json',
      internationalPublishersFile: 'international_publishers.json',
      ...config
    };

    this.ensureDirectories();
    this.loadPublisherData();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.config.dataDir)) {
      fs.mkdirSync(this.config.dataDir, { recursive: true });
    }
  }

  /**
   * Load publisher data from files
   */
  loadPublisherData() {
    console.log('📚 Loading publisher database');

    try {
      // Load German publishers
      const germanPublishersPath = path.join(this.config.dataDir, this.config.germanPublishersFile);
      if (fs.existsSync(germanPublishersPath)) {
        this.germanPublishers = JSON.parse(fs.readFileSync(germanPublishersPath, 'utf8'));
      } else {
        // Create sample data if file doesn't exist
        this.germanPublishers = this.createSampleGermanPublishers();
        this.saveGermanPublishers();
      }

      // Load international publishers
      const internationalPublishersPath = path.join(this.config.dataDir, this.config.internationalPublishersFile);
      if (fs.existsSync(internationalPublishersPath)) {
        this.internationalPublishers = JSON.parse(fs.readFileSync(internationalPublishersPath, 'utf8'));
      } else {
        // Create sample data if file doesn't exist
        this.internationalPublishers = this.createSampleInternationalPublishers();
        this.saveInternationalPublishers();
      }

      console.log(`✅ Publisher database loaded: ${this.germanPublishers.length} German publishers, ${this.internationalPublishers.length} international publishers`);
    } catch (error) {
      console.error('❌ Failed to load publisher database:', error.message);
      // Initialize with sample data on error
      this.germanPublishers = this.createSampleGermanPublishers();
      this.internationalPublishers = this.createSampleInternationalPublishers();
    }
  }

  /**
   * Create sample German publishers data
   */
  createSampleGermanPublishers() {
    return [
      {
        id: 'bertelsmann',
        name: 'Bertelsmann AG',
        website: 'https://www.bertelsmann.de',
        contact: {
          email: 'submissions@bertelsmann.de',
          phone: '+49 521 599 0',
          address: 'Carl-Bertelsmann-Straße 270, 33311 Gütersloh, Germany'
        },
        genres: ['fiction', 'non-fiction', 'business', 'politics'],
        submissionGuidelines: 'https://www.bertelsmann.de/submissions',
        preferences: {
          fictionMinPages: 200,
          nonFictionMinPages: 150,
          responseTime: '8-12 weeks'
        },
        contracts: {
          royaltyRate: '10-15%',
          advance: '€5000-50000'
        }
      },
      {
        id: 'springer',
        name: 'Springer Nature',
        website: 'https://www.springernature.com',
        contact: {
          email: 'proposals@springernature.com',
          phone: '+49 30 890030',
          address: 'Heidelberger Platz 3, 14197 Berlin, Germany'
        },
        genres: ['academic', 'scientific', 'technical', 'medicine'],
        submissionGuidelines: 'https://www.springernature.com/submissions',
        preferences: {
          academicMinPages: 250,
          peerReviewRequired: true,
          responseTime: '6-10 weeks'
        },
        contracts: {
          royaltyRate: '8-12%',
          advance: '€3000-30000'
        }
      },
      {
        id: 'piper',
        name: 'Piper Verlag',
        website: 'https://www.piper.de',
        contact: {
          email: 'info@piper.de',
          phone: '+49 89 381000',
          address: 'Rappenwörtstr. 3, 80331 Munich, Germany'
        },
        genres: ['fiction', 'literature', 'biography'],
        submissionGuidelines: 'https://www.piper.de/submissions',
        preferences: {
          fictionMinPages: 150,
          literaryQuality: 'high',
          responseTime: '10-14 weeks'
        },
        contracts: {
          royaltyRate: '12-18%',
          advance: '€10000-100000'
        }
      }
    ];
  }

  /**
   * Create sample international publishers data
   */
  createSampleInternationalPublishers() {
    return [
      {
        id: 'penguin-random',
        name: 'Penguin Random House',
        website: 'https://www.penguinrandomhouse.com',
        contact: {
          email: 'submissions@penguinrandomhouse.com',
          phone: '+1 212 782 9000',
          address: '1745 Broadway, New York, NY 10019, USA'
        },
        genres: ['fiction', 'non-fiction', 'children', 'young-adult'],
        submissionGuidelines: 'https://www.penguinrandomhouse.com/submissions',
        preferences: {
          fictionMinPages: 200,
          nonFictionMinPages: 180,
          responseTime: '12-16 weeks'
        },
        contracts: {
          royaltyRate: '10-15%',
          advance: '$10000-200000'
        }
      },
      {
        id: 'harpercollins',
        name: 'HarperCollins Publishers',
        website: 'https://www.harpercollins.com',
        contact: {
          email: 'queries@harpercollins.com',
          phone: '+1 212 207 7000',
          address: '195 Broadway, New York, NY 10007, USA'
        },
        genres: ['fiction', 'non-fiction', 'romance', 'thriller'],
        submissionGuidelines: 'https://www.harpercollins.com/submissions',
        preferences: {
          fictionMinPages: 250,
          marketPotential: 'high',
          responseTime: '10-14 weeks'
        },
        contracts: {
          royaltyRate: '12-16%',
          advance: '$15000-150000'
        }
      },
      {
        id: 'macmillan',
        name: 'Macmillan Publishers',
        website: 'https://www.macmillan.com',
        contact: {
          email: 'submissions@macmillan.com',
          phone: '+1 646 307 5700',
          address: '120 Broadway, New York, NY 10271, USA'
        },
        genres: ['fiction', 'non-fiction', 'science', 'history'],
        submissionGuidelines: 'https://www.macmillan.com/submissions',
        preferences: {
          nonFictionMinPages: 200,
          expertiseRequired: true,
          responseTime: '8-12 weeks'
        },
        contracts: {
          royaltyRate: '10-14%',
          advance: '$5000-100000'
        }
      }
    ];
  }

  /**
   * Save German publishers data
   */
  saveGermanPublishers() {
    try {
      const filepath = path.join(this.config.dataDir, this.config.germanPublishersFile);
      fs.writeFileSync(filepath, JSON.stringify(this.germanPublishers, null, 2));
      console.log(`💾 German publishers data saved: ${filepath}`);
    } catch (error) {
      console.error('❌ Failed to save German publishers data:', error.message);
    }
  }

  /**
   * Save international publishers data
   */
  saveInternationalPublishers() {
    try {
      const filepath = path.join(this.config.dataDir, this.config.internationalPublishersFile);
      fs.writeFileSync(filepath, JSON.stringify(this.internationalPublishers, null, 2));
      console.log(`💾 International publishers data saved: ${filepath}`);
    } catch (error) {
      console.error('❌ Failed to save international publishers data:', error.message);
    }
  }

  /**
   * Get relevant publishers based on genre and market
   * @param {string} genre - Book genre
   * @param {string} targetMarket - Target market
   * @returns {Promise<Array>} List of relevant publishers
   */
  async getRelevantPublishers(genre, targetMarket = 'global') {
    console.log(`🔍 Searching for relevant publishers: genre=${genre}, market=${targetMarket}`);

    try {
      let relevantPublishers = [];

      // Search in German publishers if target market is Germany or global
      if (targetMarket === 'germany' || targetMarket === 'global') {
        relevantPublishers = relevantPublishers.concat(
          this.germanPublishers.filter(publisher =>
            publisher.genres.includes(genre) || publisher.genres.includes('all')
          )
        );
      }

      // Search in international publishers if target market is global or specific international market
      if (targetMarket === 'global' || targetMarket !== 'germany') {
        relevantPublishers = relevantPublishers.concat(
          this.internationalPublishers.filter(publisher =>
            publisher.genres.includes(genre) || publisher.genres.includes('all')
          )
        );
      }

      // Remove duplicates
      const uniquePublishers = Array.from(new Set(relevantPublishers.map(p => p.id)))
        .map(id => {
          return relevantPublishers.find(p => p.id === id);
        });

      console.log(`✅ Found ${uniquePublishers.length} relevant publishers`);
      return uniquePublishers;
    } catch (error) {
      console.error('❌ Failed to get relevant publishers:', error.message);
      throw error;
    }
  }

  /**
   * Get publisher by ID
   * @param {string} publisherId - Publisher ID
   * @returns {Promise<Object|null>} Publisher data or null if not found
   */
  async getPublisherById(publisherId) {
    try {
      // Search in both German and international publishers
      let publisher = this.germanPublishers.find(p => p.id === publisherId);

      if (!publisher) {
        publisher = this.internationalPublishers.find(p => p.id === publisherId);
      }

      return publisher || null;
    } catch (error) {
      console.error(`❌ Failed to get publisher by ID ${publisherId}:`, error.message);
      return null;
    }
  }

  /**
   * Add new publisher
   * @param {Object} publisherData - Publisher data
   * @param {string} market - Target market ('german' or 'international')
   * @returns {Promise<Object>} Added publisher data
   */
  async addPublisher(publisherData, market = 'international') {
    console.log(`➕ Adding new publisher: ${publisherData.name}`);

    try {
      // Add ID if not provided
      if (!publisherData.id) {
        publisherData.id = this.generatePublisherId(publisherData.name);
      }

      // Add to appropriate list
      if (market === 'german') {
        this.germanPublishers.push(publisherData);
        this.saveGermanPublishers();
      } else {
        this.internationalPublishers.push(publisherData);
        this.saveInternationalPublishers();
      }

      console.log(`✅ Publisher added: ${publisherData.name}`);
      return publisherData;
    } catch (error) {
      console.error('❌ Failed to add publisher:', error.message);
      throw error;
    }
  }

  /**
   * Update publisher information
   * @param {string} publisherId - Publisher ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object|null>} Updated publisher data or null if not found
   */
  async updatePublisher(publisherId, updates) {
    console.log(`✏️ Updating publisher: ${publisherId}`);

    try {
      // Find and update in German publishers
      let updated = false;
      for (let i = 0; i < this.germanPublishers.length; i++) {
        if (this.germanPublishers[i].id === publisherId) {
          this.germanPublishers[i] = { ...this.germanPublishers[i], ...updates };
          updated = true;
          this.saveGermanPublishers();
          break;
        }
      }

      // If not found in German publishers, try international
      if (!updated) {
        for (let i = 0; i < this.internationalPublishers.length; i++) {
          if (this.internationalPublishers[i].id === publisherId) {
            this.internationalPublishers[i] = { ...this.internationalPublishers[i], ...updates };
            updated = true;
            this.saveInternationalPublishers();
            break;
          }
        }
      }

      if (updated) {
        const updatedPublisher = await this.getPublisherById(publisherId);
        console.log(`✅ Publisher updated: ${publisherId}`);
        return updatedPublisher;
      } else {
        console.log(`⚠️ Publisher not found: ${publisherId}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Failed to update publisher ${publisherId}:`, error.message);
      throw error;
    }
  }

  /**
   * Remove publisher
   * @param {string} publisherId - Publisher ID
   * @returns {Promise<boolean>} True if removed, false if not found
   */
  async removePublisher(publisherId) {
    console.log(`🗑️ Removing publisher: ${publisherId}`);

    try {
      let removed = false;

      // Remove from German publishers
      const germanLength = this.germanPublishers.length;
      this.germanPublishers = this.germanPublishers.filter(p => p.id !== publisherId);
      if (this.germanPublishers.length < germanLength) {
        this.saveGermanPublishers();
        removed = true;
      }

      // Remove from international publishers
      const internationalLength = this.internationalPublishers.length;
      this.internationalPublishers = this.internationalPublishers.filter(p => p.id !== publisherId);
      if (this.internationalPublishers.length < internationalLength) {
        this.saveInternationalPublishers();
        removed = true;
      }

      if (removed) {
        console.log(`✅ Publisher removed: ${publisherId}`);
      } else {
        console.log(`⚠️ Publisher not found: ${publisherId}`);
      }

      return removed;
    } catch (error) {
      console.error(`❌ Failed to remove publisher ${publisherId}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate publisher ID from name
   */
  generatePublisherId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  /**
   * Search publishers by name or genre
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching publishers
   */
  async searchPublishers(query) {
    console.log(`🔍 Searching publishers for: ${query}`);

    try {
      const searchTerm = query.toLowerCase();

      // Search in both German and international publishers
      const allPublishers = [...this.germanPublishers, ...this.internationalPublishers];

      const results = allPublishers.filter(publisher =>
        publisher.name.toLowerCase().includes(searchTerm) ||
        publisher.genres.some(genre => genre.toLowerCase().includes(searchTerm))
      );

      console.log(`✅ Found ${results.length} publishers matching query`);
      return results;
    } catch (error) {
      console.error('❌ Failed to search publishers:', error.message);
      throw error;
    }
  }

  /**
   * Get publisher database statistics
   */
  getStats() {
    try {
      return {
        germanPublishers: this.germanPublishers.length,
        internationalPublishers: this.internationalPublishers.length,
        totalPublishers: this.germanPublishers.length + this.internationalPublishers.length,
        genres: this.getAllGenres(),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get publisher database stats:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Get all unique genres from publishers
   */
  getAllGenres() {
    const allPublishers = [...this.germanPublishers, ...this.internationalPublishers];
    const genres = new Set();

    allPublishers.forEach(publisher => {
      if (publisher.genres && Array.isArray(publisher.genres)) {
        publisher.genres.forEach(genre => genres.add(genre));
      }
    });

    return Array.from(genres).sort();
  }
}

module.exports = PublisherDatabase;