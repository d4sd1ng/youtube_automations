import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, Dict, Any, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.is_connected = False

    async def connect(self, uri: str, db_name: str) -> bool:
        """
        Connects to the MongoDB database
        :param uri: MongoDB connection URI
        :param db_name: Name of the database
        :return: True if successful
        """
        try:
            self.client = AsyncIOMotorClient(uri)
            self.db = self.client[db_name]
            self.is_connected = True

            logger.info('✅ Successfully connected to the database')
            return True
        except Exception as error:
            logger.error(f'❌ Database connection error: {error}')
            self.is_connected = False
            raise error

    async def disconnect(self):
        """Disconnects from the database"""
        if self.client:
            self.client.close()
            self.is_connected = False
            logger.info('🔌 Database connection disconnected')

    def get_db(self):
        """
        Returns the database instance
        :return: MongoDB database instance
        """
        if not self.is_connected:
            raise Exception('Database is not connected')
        return self.db

    def get_collection(self, name: str):
        """
        Returns a collection
        :param name: Name of the collection
        :return: MongoDB collection
        """
        if not self.is_connected:
            raise Exception('Database is not connected')
        return self.db[name]

    async def find_one(self, collection_name: str, query: Dict[Any, Any]) -> Optional[Dict[Any, Any]]:
        """
        Finds a document in a collection
        :param collection_name: Name of the collection
        :param query: Search criteria
        :return: Found document or None
        """
        try:
            collection = self.get_collection(collection_name)
            return await collection.find_one(query)
        except Exception as error:
            logger.error(f'Error searching in collection {collection_name}: {error}')
            raise error

    async def find_many(self, collection_name: str, query: Dict[Any, Any], options: Dict[Any, Any] = None) -> List[Dict[Any, Any]]:
        """
        Finds multiple documents in a collection
        :param collection_name: Name of the collection
        :param query: Search criteria
        :param options: Search options
        :return: List of found documents
        """
        try:
            if options is None:
                options = {}

            collection = self.get_collection(collection_name)
            cursor = collection.find(query, **options)
            return await cursor.to_list(length=None)
        except Exception as error:
            logger.error(f'Error searching in collection {collection_name}: {error}')
            raise error

    async def insert_one(self, collection_name: str, document: Dict[Any, Any]) -> Any:
        """
        Inserts a document into a collection
        :param collection_name: Name of the collection
        :param document: Document to insert
        :return: Result of the operation
        """
        try:
            collection = self.get_collection(collection_name)
            return await collection.insert_one(document)
        except Exception as error:
            logger.error(f'Error inserting into collection {collection_name}: {error}')
            raise error

    async def insert_many(self, collection_name: str, documents: List[Dict[Any, Any]]) -> Any:
        """
        Inserts multiple documents into a collection
        :param collection_name: Name of the collection
        :param documents: List of documents to insert
        :return: Result of the operation
        """
        try:
            collection = self.get_collection(collection_name)
            return await collection.insert_many(documents)
        except Exception as error:
            logger.error(f'Error inserting into collection {collection_name}: {error}')
            raise error

    async def update_one(self, collection_name: str, filter_query: Dict[Any, Any], update: Dict[Any, Any], options: Dict[Any, Any] = None) -> Any:
        """
        Updates a document in a collection
        :param collection_name: Name of the collection
        :param filter_query: Filter criteria
        :param update: Update data
        :param options: Update options
        :return: Result of the operation
        """
        try:
            if options is None:
                options = {}

            collection = self.get_collection(collection_name)
            return await collection.update_one(filter_query, update, **options)
        except Exception as error:
            logger.error(f'Error updating in collection {collection_name}: {error}')
            raise error

    async def update_many(self, collection_name: str, filter_query: Dict[Any, Any], update: Dict[Any, Any], options: Dict[Any, Any] = None) -> Any:
        """
        Updates multiple documents in a collection
        :param collection_name: Name of the collection
        :param filter_query: Filter criteria
        :param update: Update data
        :param options: Update options
        :return: Result of the operation
        """
        try:
            if options is None:
                options = {}

            collection = self.get_collection(collection_name)
            return await collection.update_many(filter_query, update, **options)
        except Exception as error:
            logger.error(f'Error updating in collection {collection_name}: {error}')
            raise error

    async def delete_one(self, collection_name: str, filter_query: Dict[Any, Any]) -> Any:
        """
        Deletes a document from a collection
        :param collection_name: Name of the collection
        :param filter_query: Filter criteria
        :return: Result of the operation
        """
        try:
            collection = self.get_collection(collection_name)
            return await collection.delete_one(filter_query)
        except Exception as error:
            logger.error(f'Error deleting from collection {collection_name}: {error}')
            raise error

    async def delete_many(self, collection_name: str, filter_query: Dict[Any, Any]) -> Any:
        """
        Deletes multiple documents from a collection
        :param collection_name: Name of the collection
        :param filter_query: Filter criteria
        :return: Result of the operation
        """
        try:
            collection = self.get_collection(collection_name)
            return await collection.delete_many(filter_query)
        except Exception as error:
            logger.error(f'Error deleting from collection {collection_name}: {error}')
            raise error

if __name__ == "__main__":
    # Example usage
    async def main():
        db_service = DatabaseService()
        try:
            # Connect to MongoDB (adjust URI as needed)
            # await db_service.connect("mongodb://localhost:27017/", "agents")
            print("Database Service Agent initialized successfully!")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            await db_service.disconnect()

    asyncio.run(main())