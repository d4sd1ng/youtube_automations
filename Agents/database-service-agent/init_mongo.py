#!/usr/bin/env python3
"""
MongoDB Initialization Script
Creates the database and collections
"""

from pymongo import MongoClient

def init_database():
    # Connect to MongoDB
    client = MongoClient('mongodb://localhost:27017/')

    # Get or create database
    db = client['agents']

    # Create collections
    collections = ['users', 'customers', 'invoices', 'payments']

    for collection_name in collections:
        if collection_name not in db.list_collection_names():
            db.create_collection(collection_name)
            print(f'✅ Created collection: {collection_name}')
        else:
            print(f'⚠️  Collection already exists: {collection_name}')

    # Create indexes for better performance
    # Users indexes
    db.users.create_index("email", unique=True)
    db.users.create_index("id", unique=True)
    db.users.create_index("apiKey", unique=True)
    print('✅ Created indexes for users collection')

    # Customers indexes
    db.customers.create_index("email", unique=True)
    db.customers.create_index("id", unique=True)
    print('✅ Created indexes for customers collection')

    # Invoices indexes
    db.invoices.create_index("customerId")
    db.invoices.create_index("id", unique=True)
    print('✅ Created indexes for invoices collection')

    # Payments indexes
    db.payments.create_index("customerId")
    db.payments.create_index("id", unique=True)
    print('✅ Created indexes for payments collection')

    print('✅ Database and collections successfully created')

    # Close connection
    client.close()

if __name__ == "__main__":
    init_database()