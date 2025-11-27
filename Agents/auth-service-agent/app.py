#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Auth Service Agent
Service for authentication and authorization
"""

import os
import jwt
import bcrypt
import logging
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AuthServiceAgent:
    def __init__(self):
        self.jwt_secret = os.environ.get("JWT_SECRET", "default_secret")
        self.jwt_expiration = os.environ.get("JWT_EXPIRATION", "24h")
        self.salt_rounds = 10
        
        # For now, we'll use a simple in-memory storage
        # In a real implementation, this would be replaced with a database connection
        self.users = {}
    
    def generate_user_id(self) -> str:
        """Generate a unique user ID"""
        return f"user_{secrets.token_hex(16)}"
    
    def generate_api_key(self) -> str:
        """Generate an API key"""
        return f"api_{secrets.token_hex(32)}"
    
    async def register_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register a new user
        """
        try:
            # Validate user data
            if not user_data.get("email") or not user_data.get("password"):
                raise ValueError("Email and password are required")
            
            # Check if user already exists
            for user in self.users.values():
                if user["email"] == user_data["email"]:
                    raise ValueError("User with this email already exists")
            
            # Hash password
            password_bytes = user_data["password"].encode('utf-8')
            hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt(self.salt_rounds))
            
            # Create user object
            user_id = self.generate_user_id()
            user = {
                "id": user_id,
                "email": user_data["email"],
                "name": user_data.get("name", "Anonymous"),
                "password": hashed_password,
                "created_at": datetime.now().isoformat(),
                "api_key": self.generate_api_key()
            }
            
            # Store user
            self.users[user_id] = user
            
            # Generate JWT token
            token = self.generate_token(user_id, user_data["email"])
            
            # Remove password from response
            user_without_password = {k: v for k, v in user.items() if k != "password"}
            
            return {
                "success": True,
                "token": token,
                "user": user_without_password
            }
        except Exception as error:
            logger.error(f"❌ Auth Service: User registration failed: {error}")
            return {
                "success": False,
                "error": str(error)
            }
    
    async def authenticate_user(self, email: str, password: str) -> Dict[str, Any]:
        """
        Authenticate a user
        """
        try:
            # Find user by email
            user = None
            for u in self.users.values():
                if u["email"] == email:
                    user = u
                    break
            
            if not user:
                raise ValueError("User not found")
            
            # Validate password
            password_bytes = password.encode('utf-8')
            if not bcrypt.checkpw(password_bytes, user["password"]):
                raise ValueError("Invalid password")
            
            # Generate JWT token
            token = self.generate_token(user["id"], email)
            
            # Remove password from response
            user_without_password = {k: v for k, v in user.items() if k != "password"}
            
            return {
                "success": True,
                "token": token,
                "user": user_without_password
            }
        except Exception as error:
            logger.error(f"❌ Auth Service: User authentication failed: {error}")
            return {
                "success": False,
                "error": str(error)
            }
    
    def generate_token(self, user_id: str, email: str) -> str:
        """
        Generate a JWT token
        """
        # Parse expiration time
        if self.jwt_expiration.endswith('h'):
            hours = int(self.jwt_expiration[:-1])
            expire = datetime.now() + timedelta(hours=hours)
        elif self.jwt_expiration.endswith('d'):
            days = int(self.jwt_expiration[:-1])
            expire = datetime.now() + timedelta(days=days)
        else:
            expire = datetime.now() + timedelta(hours=24)  # Default to 24 hours
        
        payload = {
            "user_id": user_id,
            "email": email,
            "exp": expire.timestamp()
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm="HS256")
    
    def validate_token(self, token: str) -> Dict[str, Any]:
        """
        Validate a JWT token
        """
        try:
            decoded = jwt.decode(token, self.jwt_secret, algorithms=["HS256"])
            return {
                "success": True,
                "decoded": decoded
            }
        except jwt.ExpiredSignatureError:
            return {
                "success": False,
                "error": "Token has expired"
            }
        except jwt.InvalidTokenError as error:
            return {
                "success": False,
                "error": f"Invalid token: {str(error)}"
            }
    
    async def find_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Find a user by email
        """
        for user in self.users.values():
            if user["email"] == email:
                return user
        return None
    
    async def find_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Find a user by ID
        """
        return self.users.get(user_id)
    
    async def validate_api_key(self, api_key: str) -> Dict[str, Any]:
        """
        Validate an API key
        """
        for user in self.users.values():
            if user["api_key"] == api_key:
                return {
                    "success": True,
                    "user_id": user["id"]
                }
        
        return {
            "success": False,
            "error": "Invalid API key"
        }

# Main execution
if __name__ == "__main__":
    service = AuthServiceAgent()
    logger.info("🎬 Auth Service Agent initialized")
    logger.info(f"🔑 JWT Secret configured: {'Yes' if service.jwt_secret != 'default_secret' else 'No (using default)'}")