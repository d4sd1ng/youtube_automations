// MongoDB Initialisierungsskript
// Erstellt die Datenbank und Collections

db = db.getSiblingDB('agents');

// Erstelle Collections
db.createCollection('users');
db.createCollection('customers');
db.createCollection('invoices');
db.createCollection('payments');

// Erstelle Indizes für bessere Performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "id": 1 }, { unique: true });
db.users.createIndex({ "apiKey": 1 }, { unique: true });

db.customers.createIndex({ "email": 1 }, { unique: true });
db.customers.createIndex({ "id": 1 }, { unique: true });

db.invoices.createIndex({ "customerId": 1 });
db.invoices.createIndex({ "id": 1 }, { unique: true });

db.payments.createIndex({ "customerId": 1 });
db.payments.createIndex({ "id": 1 }, { unique: true });

print('✅ Datenbank und Collections erfolgreich erstellt');