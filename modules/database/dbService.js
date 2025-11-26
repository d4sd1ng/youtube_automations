const { MongoClient } = require('mongodb');

/**
 * Database Service
 * Zentraler Service für Datenbankoperationen
 */
class DatabaseService {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  /**
   * Verbindet sich mit der MongoDB-Datenbank
   * @param {string} uri - MongoDB Verbindungs-URI
   * @param {string} dbName - Name der Datenbank
   */
  async connect(uri, dbName) {
    try {
      this.client = new MongoClient(uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true
      });

      await this.client.connect();
      this.db = this.client.db(dbName);
      this.isConnected = true;

      console.log('✅ Erfolgreich mit der Datenbank verbunden');
      return true;
    } catch (error) {
      console.error('❌ Fehler bei der Datenbankverbindung:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Trennt die Verbindung zur Datenbank
   */
  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('🔌 Datenbankverbindung getrennt');
    }
  }

  /**
   * Gibt die Datenbankinstanz zurück
   * @returns {Db} MongoDB-Datenbankinstanz
   */
  getDB() {
    if (!this.isConnected) {
      throw new Error('Datenbank ist nicht verbunden');
    }
    return this.db;
  }

  /**
   * Gibt eine Collection zurück
   * @param {string} name - Name der Collection
   * @returns {Collection} MongoDB-Collection
   */
  getCollection(name) {
    if (!this.isConnected) {
      throw new Error('Datenbank ist nicht verbunden');
    }
    return this.db.collection(name);
  }

  /**
   * Findet ein Dokument in einer Collection
   * @param {string} collectionName - Name der Collection
   * @param {Object} query - Suchkriterien
   * @returns {Object|null} Gefundenes Dokument oder null
   */
  async findOne(collectionName, query) {
    try {
      const collection = this.getCollection(collectionName);
      return await collection.findOne(query);
    } catch (error) {
      console.error(`Fehler beim Suchen in Collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Findet mehrere Dokumente in einer Collection
   * @param {string} collectionName - Name der Collection
   * @param {Object} query - Suchkriterien
   * @param {Object} options - Optionen für die Suche
   * @returns {Array} Array von gefundenen Dokumenten
   */
  async findMany(collectionName, query, options = {}) {
    try {
      const collection = this.getCollection(collectionName);
      return await collection.find(query, options).toArray();
    } catch (error) {
      console.error(`Fehler beim Suchen in Collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Fügt ein Dokument zu einer Collection hinzu
   * @param {string} collectionName - Name der Collection
   * @param {Object} document - Hinzuzufügendes Dokument
   * @returns {Object} Ergebnis der Operation
   */
  async insertOne(collectionName, document) {
    try {
      const collection = this.getCollection(collectionName);
      return await collection.insertOne(document);
    } catch (error) {
      console.error(`Fehler beim Einfügen in Collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Fügt mehrere Dokumente zu einer Collection hinzu
   * @param {string} collectionName - Name der Collection
   * @param {Array} documents - Array von hinzuzufügenden Dokumenten
   * @returns {Object} Ergebnis der Operation
   */
  async insertMany(collectionName, documents) {
    try {
      const collection = this.getCollection(collectionName);
      return await collection.insertMany(documents);
    } catch (error) {
      console.error(`Fehler beim Einfügen in Collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Aktualisiert ein Dokument in einer Collection
   * @param {string} collectionName - Name der Collection
   * @param {Object} filter - Filterkriterien
   * @param {Object} update - Aktualisierungsdaten
   * @param {Object} options - Optionen für die Aktualisierung
   * @returns {Object} Ergebnis der Operation
   */
  async updateOne(collectionName, filter, update, options = {}) {
    try {
      const collection = this.getCollection(collectionName);
      return await collection.updateOne(filter, update, options);
    } catch (error) {
      console.error(`Fehler beim Aktualisieren in Collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Aktualisiert mehrere Dokumente in einer Collection
   * @param {string} collectionName - Name der Collection
   * @param {Object} filter - Filterkriterien
   * @param {Object} update - Aktualisierungsdaten
   * @param {Object} options - Optionen für die Aktualisierung
   * @returns {Object} Ergebnis der Operation
   */
  async updateMany(collectionName, filter, update, options = {}) {
    try {
      const collection = this.getCollection(collectionName);
      return await collection.updateMany(filter, update, options);
    } catch (error) {
      console.error(`Fehler beim Aktualisieren in Collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Löscht ein Dokument aus einer Collection
   * @param {string} collectionName - Name der Collection
   * @param {Object} filter - Filterkriterien
   * @returns {Object} Ergebnis der Operation
   */
  async deleteOne(collectionName, filter) {
    try {
      const collection = this.getCollection(collectionName);
      return await collection.deleteOne(filter);
    } catch (error) {
      console.error(`Fehler beim Löschen aus Collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Löscht mehrere Dokumente aus einer Collection
   * @param {string} collectionName - Name der Collection
   * @param {Object} filter - Filterkriterien
   * @returns {Object} Ergebnis der Operation
   */
  async deleteMany(collectionName, filter) {
    try {
      const collection = this.getCollection(collectionName);
      return await collection.deleteMany(filter);
    } catch (error) {
      console.error(`Fehler beim Löschen aus Collection ${collectionName}:`, error);
      throw error;
    }
  }
}

module.exports = DatabaseService;