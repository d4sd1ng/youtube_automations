const crypto = require('crypto');
const DatabaseService = require('../database/dbService');

/**
 * BillingService - Service für Abrechnung und Monetarisierung
 *
 * Dieser Service bietet Funktionen für:
 * - Abonnement-Management
 * - API-Nutzungszähler
 * - Rechnungserstellung
 * - Zahlungsabwicklung (Integration mit Stripe, PayPal, etc.)
 */
class BillingService {
  constructor(options = {}) {
    this.plans = {
      free: {
        name: 'Free',
        price: 0,
        requestsPerDay: 100,
        features: ['Basic SEO optimization', 'Limited API access']
      },
      pro: {
        name: 'Pro',
        price: 29.99,
        requestsPerDay: 1000,
        features: ['Advanced SEO optimization', 'Full API access', 'Priority support']
      },
      enterprise: {
        name: 'Enterprise',
        price: 99.99,
        requestsPerDay: 10000,
        features: ['All Pro features', 'Custom integrations', 'Dedicated support', 'SLA']
      }
    };

    this.usageLimits = {
      free: 100,
      pro: 1000,
      enterprise: 10000
    };

    this.dbService = new DatabaseService();
  }

  /**
   * Initialisiert die Datenbankverbindung
   */
  async initDB() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      const dbName = process.env.MONGODB_DB_NAME || 'agents';
      await this.dbService.connect(mongoUri, dbName);
      console.log('✅ Billing Service: Datenbankverbindung hergestellt');
    } catch (error) {
      console.error('❌ Billing Service: Fehler bei der Datenbankverbindung:', error);
      throw error;
    }
  }

  /**
   * Erstellt einen neuen Kunden
   * @param {Object} customerData - Kundendaten
   * @returns {Object} Kundeninformationen
   */
  async createCustomer(customerData) {
    try {
      // Prüfen ob Kunde bereits existiert
      const existingCustomer = await this.dbService.findOne('customers', { email: customerData.email });
      if (existingCustomer) {
        throw new Error('Kunde mit dieser E-Mail existiert bereits');
      }

      // Kundenobjekt erstellen
      const customer = {
        id: this.generateCustomerId(),
        email: customerData.email,
        name: customerData.name,
        subscription: {
          plan: 'free',
          startDate: new Date().toISOString(),
          endDate: null,
          status: 'active'
        },
        usage: {
          currentDay: new Date().toISOString().split('T')[0],
          requests: 0,
          limit: this.usageLimits.free
        },
        paymentMethods: [],
        invoices: [],
        createdAt: new Date().toISOString()
      };

      // Kunden in der Datenbank speichern
      await this.dbService.insertOne('customers', customer);

      return {
        success: true,
        customer
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Fügt eine Zahlungsmethode zu einem Kunden hinzu
   * @param {string} customerId - Kunden-ID
   * @param {Object} paymentMethod - Zahlungsmethodendaten (tokenisiert)
   * @returns {Object} Aktualisierte Kundeninformationen
   */
  async addPaymentMethod(customerId, paymentMethod) {
    try {
      // Kunden aus der Datenbank laden
      const customer = await this.getCustomerById(customerId);
      if (!customer) {
        throw new Error('Kunde nicht gefunden');
      }

      // Zahlungsmethoden-Objekt erstellen (ohne sensible Daten)
      const paymentMethodObj = {
        id: this.generatePaymentMethodId(),
        type: paymentMethod.type, // z.B. 'card', 'paypal'
        // Sensible Daten wie Kreditkartennummern werden NIEMALS gespeichert
        // Stattdessen verwenden wir tokenisierte Referenzen zu externen Zahlungsanbietern
        last4: paymentMethod.last4, // Letzte 4 Ziffern für Anzeige
        brand: paymentMethod.brand, // Kartenmarke
        expMonth: paymentMethod.expMonth,
        expYear: paymentMethod.expYear,
        externalId: paymentMethod.externalId, // Referenz zum externen Zahlungsanbieter
        isDefault: customer.paymentMethods.length === 0 // Erste Methode ist Standard
      };

      // Zahlungsmethode zur Datenbank hinzufügen
      await this.dbService.updateOne(
        'customers',
        { id: customerId },
        { $push: { paymentMethods: paymentMethodObj } }
      );

      // Aktualisierten Kunden zurückgeben
      const updatedCustomer = await this.getCustomerById(customerId);
      return {
        success: true,
        customer: updatedCustomer
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Setzt eine Zahlungsmethode als Standard
   * @param {string} customerId - Kunden-ID
   * @param {string} paymentMethodId - Zahlungsmethoden-ID
   * @returns {Object} Aktualisierte Kundeninformationen
   */
  async setDefaultPaymentMethod(customerId, paymentMethodId) {
    try {
      // Kunden aus der Datenbank laden
      const customer = await this.getCustomerById(customerId);
      if (!customer) {
        throw new Error('Kunde nicht gefunden');
      }

      // Zahlungsmethoden aktualisieren
      const updatedPaymentMethods = customer.paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === paymentMethodId
      }));

      // In der Datenbank aktualisieren
      await this.dbService.updateOne(
        'customers',
        { id: customerId },
        { $set: { paymentMethods: updatedPaymentMethods } }
      );

      // Aktualisierten Kunden zurückgeben
      const updatedCustomer = await this.getCustomerById(customerId);
      return {
        success: true,
        customer: updatedCustomer
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Entfernt eine Zahlungsmethode von einem Kunden
   * @param {string} customerId - Kunden-ID
   * @param {string} paymentMethodId - Zahlungsmethoden-ID
   * @returns {Object} Aktualisierte Kundeninformationen
   */
  async removePaymentMethod(customerId, paymentMethodId) {
    try {
      // Kunden aus der Datenbank laden
      const customer = await this.getCustomerById(customerId);
      if (!customer) {
        throw new Error('Kunde nicht gefunden');
      }

      // Prüfen ob die Methode existiert
      const paymentMethodExists = customer.paymentMethods.some(method => method.id === paymentMethodId);
      if (!paymentMethodExists) {
        throw new Error('Zahlungsmethode nicht gefunden');
      }

      // Prüfen ob es die letzte Methode ist
      if (customer.paymentMethods.length === 1) {
        throw new Error('Mindestens eine Zahlungsmethode ist erforderlich');
      }

      // Zahlungsmethode entfernen
      const updatedPaymentMethods = customer.paymentMethods.filter(method => method.id !== paymentMethodId);

      // In der Datenbank aktualisieren
      await this.dbService.updateOne(
        'customers',
        { id: customerId },
        { $set: { paymentMethods: updatedPaymentMethods } }
      );

      // Aktualisierten Kunden zurückgeben
      const updatedCustomer = await this.getCustomerById(customerId);
      return {
        success: true,
        customer: updatedCustomer
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Aktualisiert das Abonnement eines Kunden
   * @param {string} customerId - Kunden-ID
   * @param {string} plan - Neuer Plan
   * @returns {Object} Aktualisierte Abonnementinformationen
   */
  async updateSubscription(customerId, plan) {
    try {
      if (!this.plans[plan]) {
        throw new Error('Ungültiger Plan');
      }

      // Kunden aus der Datenbank laden
      const customer = await this.getCustomerById(customerId);
      if (!customer) {
        throw new Error('Kunde nicht gefunden');
      }

      // Abonnement aktualisieren
      const subscription = {
        plan: plan,
        startDate: new Date().toISOString(),
        endDate: null,
        status: 'active'
      };

      // Nutzungslimit aktualisieren
      const usage = {
        currentDay: customer.usage.currentDay,
        requests: customer.usage.requests,
        limit: this.usageLimits[plan]
      };

      // In der Datenbank aktualisieren
      await this.dbService.updateOne(
        'customers',
        { id: customerId },
        {
          $set: {
            subscription: subscription,
            usage: usage
          }
        }
      );

      return {
        success: true,
        subscription
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Prüft das Nutzungslimit eines Kunden
   * @param {string} customerId - Kunden-ID
   * @returns {Object} Nutzungsinformationen
   */
  async checkUsageLimit(customerId) {
    try {
      // Kunden aus der Datenbank laden
      const customer = await this.getCustomerById(customerId);

      if (!customer) {
        throw new Error('Kunde nicht gefunden');
      }

      const today = new Date().toISOString().split('T')[0];

      // Reset usage counter if it's a new day
      if (customer.usage.currentDay !== today) {
        const updatedUsage = {
          currentDay: today,
          requests: 0,
          limit: customer.usage.limit
        };

        // In der Datenbank aktualisieren
        await this.dbService.updateOne(
          'customers',
          { id: customerId },
          { $set: { usage: updatedUsage } }
        );

        customer.usage = updatedUsage;
      }

      const usageInfo = {
        current: customer.usage.requests,
        limit: customer.usage.limit,
        remaining: customer.usage.limit - customer.usage.requests,
        resetDate: today
      };

      return {
        success: true,
        usage: usageInfo,
        isOverLimit: customer.usage.requests >= customer.usage.limit
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Erhöht den Nutzungszähler eines Kunden
   * @param {string} customerId - Kunden-ID
   * @returns {Object} Aktualisierte Nutzungsinformationen
   */
  async incrementUsage(customerId) {
    try {
      // Nutzung prüfen
      const usageCheck = await this.checkUsageLimit(customerId);

      if (!usageCheck.success) {
        throw new Error(usageCheck.error);
      }

      if (usageCheck.isOverLimit) {
        throw new Error('Nutzungslimit erreicht');
      }

      // Kunden aus der Datenbank laden
      const customer = await this.getCustomerById(customerId);
      if (!customer) {
        throw new Error('Kunde nicht gefunden');
      }

      // Nutzungszähler erhöhen
      const newRequests = customer.usage.requests + 1;
      const newUsage = {
        currentDay: customer.usage.currentDay,
        requests: newRequests,
        limit: customer.usage.limit
      };

      // In der Datenbank aktualisieren
      await this.dbService.updateOne(
        'customers',
        { id: customerId },
        { $set: { usage: newUsage } }
      );

      const usageInfo = {
        current: newRequests,
        limit: customer.usage.limit,
        remaining: customer.usage.limit - newRequests,
        resetDate: customer.usage.currentDay
      };

      return {
        success: true,
        usage: usageInfo,
        isOverLimit: newRequests >= customer.usage.limit
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Erstellt eine Rechnung für einen Kunden
   * @param {string} customerId - Kunden-ID
   * @param {Object} invoiceData - Rechnungsdaten
   * @returns {Object} Rechnungsinformationen
   */
  async createInvoice(customerId, invoiceData) {
    try {
      // Kunden aus der Datenbank laden
      const customer = await this.getCustomerById(customerId);
      if (!customer) {
        throw new Error('Kunde nicht gefunden');
      }

      // Rechnungsobjekt erstellen
      const invoice = {
        id: this.generateInvoiceId(),
        customerId: customerId,
        amount: invoiceData.amount,
        currency: invoiceData.currency || 'EUR',
        description: invoiceData.description,
        status: 'pending',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 Tage in der Zukunft
      };

      // Rechnung in der Datenbank speichern
      await this.dbService.insertOne('invoices', invoice);

      // Rechnung zur Kundenliste hinzufügen
      await this.dbService.updateOne(
        'customers',
        { id: customerId },
        { $push: { invoices: invoice.id } }
      );

      return {
        success: true,
        invoice
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verarbeitet eine Zahlung
   * @param {string} customerId - Kunden-ID
   * @param {Object} paymentData - Zahlungsdaten
   * @returns {Object} Zahlungsinformationen
   */
  async processPayment(customerId, paymentData) {
    try {
      // Kunden aus der Datenbank laden
      const customer = await this.getCustomerById(customerId);
      if (!customer) {
        throw new Error('Kunde nicht gefunden');
      }

      // Prüfen ob eine Zahlungsmethode angegeben wurde
      if (!paymentData.paymentMethodId) {
        throw new Error('Zahlungsmethode ist erforderlich');
      }

      // Zahlungsmethode finden
      const paymentMethod = customer.paymentMethods.find(method => method.id === paymentData.paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Zahlungsmethode nicht gefunden');
      }

      // Zahlungsobjekt erstellen (ohne sensible Daten)
      const payment = {
        id: this.generatePaymentId(),
        customerId: customerId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'EUR',
        paymentMethodId: paymentData.paymentMethodId,
        paymentMethodType: paymentMethod.type,
        status: 'succeeded',
        processedAt: new Date().toISOString()
      };

      // Zahlung in der Datenbank speichern
      await this.dbService.insertOne('payments', payment);

      return {
        success: true,
        payment
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Findet einen Kunden anhand der ID
   * @param {string} customerId - Kunden-ID
   * @returns {Object|null} Kundenobjekt oder null
   */
  async getCustomerById(customerId) {
    // Kunden aus der Datenbank laden
    const customer = await this.dbService.findOne('customers', { id: customerId });
    return customer;
  }

  /**
   * Generiert eine eindeutige Kunden-ID
   * @returns {string} Eindeutige Kunden-ID
   */
  generateCustomerId() {
    return 'customer_' + crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generiert eine eindeutige Rechnungs-ID
   * @returns {string} Eindeutige Rechnungs-ID
   */
  generateInvoiceId() {
    return 'invoice_' + crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generiert eine eindeutige Zahlungs-ID
   * @returns {string} Eindeutige Zahlungs-ID
   */
  generatePaymentId() {
    return 'payment_' + crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generiert eine eindeutige Zahlungsmethoden-ID
   * @returns {string} Eindeutige Zahlungsmethoden-ID
   */
  generatePaymentMethodId() {
    return 'pm_' + crypto.randomBytes(16).toString('hex');
  }

  /**
   * Holt die verfügbaren Abonnement-Pläne
   * @returns {Object} Abonnement-Pläne
   */
  getPlans() {
    return this.plans;
  }
}

module.exports = BillingService;