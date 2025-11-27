#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Rate Limiter Agent
Service for implementing rate limiting for various types of requests
"""

import time
import json
import logging
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RateLimiterAgent:
    def __init__(self):
        # Storage for rate limiting data
        self.limits = defaultdict(list)
        
        # Default rate limits
        self.default_limits = {
            "general": {
                "window_ms": 15 * 60 * 1000,  # 15 minutes
                "max_requests": 100,
                "message": "Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut."
            },
            "strict": {
                "window_ms": 15 * 60 * 1000,  # 15 minutes
                "max_requests": 5,
                "message": "Zu viele Anfragen von dieser IP. Bitte versuchen Sie es später erneut."
            },
            "auth": {
                "window_ms": 15 * 60 * 1000,  # 15 minutes
                "max_requests": 10,
                "message": "Zu viele Authentifizierungsversuche. Bitte versuchen Sie es später erneut."
            },
            "api": {
                "window_ms": 60 * 1000,  # 1 minute
                "max_requests": 30,
                "message": "API-Rate-Limit überschritten. Bitte reduzieren Sie die Anfragen."
            }
        }
        
        # Data directory
        self.data_dir = Path(__file__).parent / "data"
        self.data_dir.mkdir(exist_ok=True)
        
    def check_rate_limit(self, ip: str, limit_type: str = "general") -> Dict[str, Any]:
        """
        Check if an IP has exceeded its rate limit
        
        Args:
            ip (str): Client IP address
            limit_type (str): Type of limit to check (general, strict, auth, api)
            
        Returns:
            Dict[str, Any]: Result with allowed status and remaining requests
        """
        try:
            # Get limit configuration
            limit_config = self.default_limits.get(limit_type, self.default_limits["general"])
            window_ms = limit_config["window_ms"]
            max_requests = limit_config["max_requests"]
            message = limit_config["message"]
            
            # Get current timestamp
            now = datetime.now()
            window_start = now - timedelta(milliseconds=window_ms)
            
            # Clean old entries
            self.limits[ip] = [
                timestamp for timestamp in self.limits[ip] 
                if timestamp > window_start
            ]
            
            # Check if limit is exceeded
            current_requests = len(self.limits[ip])
            allowed = current_requests < max_requests
            
            if allowed:
                # Add current request
                self.limits[ip].append(now)
                remaining = max_requests - current_requests - 1
            else:
                remaining = 0
            
            return {
                "allowed": allowed,
                "remaining": remaining,
                "limit": max_requests,
                "window_ms": window_ms,
                "reset_time": (now + timedelta(milliseconds=window_ms)).isoformat(),
                "message": message if not allowed else None
            }
            
        except Exception as e:
            logger.error(f"Error checking rate limit: {str(e)}")
            return {
                "allowed": True,  # Allow request on error
                "remaining": -1,
                "limit": -1,
                "window_ms": -1,
                "reset_time": None,
                "message": None
            }
    
    def get_general_limiter(self, ip: str) -> Dict[str, Any]:
        """Get general rate limiter result"""
        return self.check_rate_limit(ip, "general")
    
    def get_strict_limiter(self, ip: str) -> Dict[str, Any]:
        """Get strict rate limiter result"""
        return self.check_rate_limit(ip, "strict")
    
    def get_auth_limiter(self, ip: str) -> Dict[str, Any]:
        """Get auth rate limiter result"""
        return self.check_rate_limit(ip, "auth")
    
    def get_api_limiter(self, ip: str) -> Dict[str, Any]:
        """Get API rate limiter result"""
        return self.check_rate_limit(ip, "api")
    
    def create_custom_limiter(self, ip: str, window_ms: int, max_requests: int, message: str = "Rate limit überschritten") -> Dict[str, Any]:
        """
        Create and check a custom rate limiter
        
        Args:
            ip (str): Client IP address
            window_ms (int): Time window in milliseconds
            max_requests (int): Maximum number of requests
            message (str): Error message when limit is exceeded
            
        Returns:
            Dict[str, Any]: Result with allowed status and remaining requests
        """
        try:
            # Get current timestamp
            now = datetime.now()
            window_start = now - timedelta(milliseconds=window_ms)
            
            # Create key for custom limiter
            custom_key = f"{ip}_custom_{window_ms}_{max_requests}"
            
            # Clean old entries
            self.limits[custom_key] = [
                timestamp for timestamp in self.limits[custom_key] 
                if timestamp > window_start
            ]
            
            # Check if limit is exceeded
            current_requests = len(self.limits[custom_key])
            allowed = current_requests < max_requests
            
            if allowed:
                # Add current request
                self.limits[custom_key].append(now)
                remaining = max_requests - current_requests - 1
            else:
                remaining = 0
            
            return {
                "allowed": allowed,
                "remaining": remaining,
                "limit": max_requests,
                "window_ms": window_ms,
                "reset_time": (now + timedelta(milliseconds=window_ms)).isoformat(),
                "message": message if not allowed else None
            }
            
        except Exception as e:
            logger.error(f"Error checking custom rate limit: {str(e)}")
            return {
                "allowed": True,  # Allow request on error
                "remaining": -1,
                "limit": -1,
                "window_ms": -1,
                "reset_time": None,
                "message": None
            }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get rate limiter statistics"""
        try:
            total_ips = len(self.limits)
            total_requests = sum(len(requests) for requests in self.limits.values())
            
            return {
                "total_ips": total_ips,
                "total_requests": total_requests,
                "limits": dict(self.default_limits)
            }
        except Exception as e:
            logger.error(f"Error getting stats: {str(e)}")
            return {
                "error": str(e)
            }
    
    def reset_ip_limits(self, ip: str) -> bool:
        """
        Reset rate limits for a specific IP
        
        Args:
            ip (str): Client IP address
            
        Returns:
            bool: Success status
        """
        try:
            # Remove all entries for this IP
            keys_to_remove = [key for key in self.limits.keys() if key.startswith(ip)]
            for key in keys_to_remove:
                del self.limits[key]
            
            return True
        except Exception as e:
            logger.error(f"Error resetting IP limits: {str(e)}")
            return False

# Main execution
if __name__ == "__main__":
    agent = RateLimiterAgent()
    print("Rate Limiter Agent initialized")