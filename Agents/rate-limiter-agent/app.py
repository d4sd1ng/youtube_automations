import time
from collections import defaultdict
from typing import Dict, Any, Optional, Callable
from datetime import datetime, timedelta
import logging
from functools import wraps

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RateLimitInfo:
    def __init__(self, window_ms: int, max_requests: int, message: str):
        self.window_ms = window_ms
        self.max_requests = max_requests
        self.message = message
        self.requests = []

class RateLimiterService:
    def __init__(self):
        """Initialize Rate Limiter Service"""
        # Store rate limit info for each IP
        self.limits: Dict[str, Dict[str, RateLimitInfo]] = defaultdict(dict)

        # Standard Rate Limit for general API requests
        self.general_config = {
            "window_ms": 15 * 60 * 1000,  # 15 minutes
            "max_requests": 100,  # 100 requests per window per IP
            "message": "Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut."
        }

        # Strict Rate Limit for sensitive endpoints (e.g., Auth, Payments)
        self.strict_config = {
            "window_ms": 15 * 60 * 1000,  # 15 minutes
            "max_requests": 5,  # 5 requests per window per IP
            "message": "Zu viele Anfragen von dieser IP. Bitte versuchen Sie es später erneut."
        }

        # Auth Rate Limit
        self.auth_config = {
            "window_ms": 15 * 60 * 1000,  # 15 minutes
            "max_requests": 10,  # 10 requests per window per IP
            "message": "Zu viele Authentifizierungsversuche. Bitte versuchen Sie es später erneut."
        }

        # API endpoint Rate Limit
        self.api_config = {
            "window_ms": 60 * 1000,  # 1 minute
            "max_requests": 30,  # 30 requests per window per IP
            "message": "API-Rate-Limit überschritten. Bitte reduzieren Sie die Anfragen."
        }

    def _get_client_ip(self, request) -> str:
        """
        Extract client IP from request
        :param request: HTTP request object
        :return: Client IP address
        """
        # This is a simplified version - in a real implementation you would extract
        # the IP from the request headers or transport layer
        return getattr(request, "client_ip", "127.0.0.1")

    def _clean_old_requests(self, limit_info: RateLimitInfo, current_time: float):
        """
        Remove old requests outside the time window
        :param limit_info: Rate limit info
        :param current_time: Current timestamp
        """
        cutoff_time = current_time - (limit_info.window_ms / 1000)
        limit_info.requests = [req_time for req_time in limit_info.requests if req_time > cutoff_time]

    def _check_limit(self, identifier: str, limit_type: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check if the rate limit is exceeded
        :param identifier: Unique identifier (usually IP address)
        :param limit_type: Type of limit
        :param config: Limit configuration
        :return: Result with limit info
        """
        current_time = time.time()

        # Get or create limit info for this identifier and type
        if limit_type not in self.limits[identifier]:
            self.limits[identifier][limit_type] = RateLimitInfo(
                config["window_ms"],
                config["max_requests"],
                config["message"]
            )

        limit_info = self.limits[identifier][limit_type]

        # Clean old requests
        self._clean_old_requests(limit_info, current_time)

        # Check if limit is exceeded
        if len(limit_info.requests) >= limit_info.max_requests:
            # Calculate reset time
            oldest_request = min(limit_info.requests) if limit_info.requests else current_time
            reset_time = oldest_request + (limit_info.window_ms / 1000)
            retry_after = max(0, int(reset_time - current_time))

            return {
                "limited": True,
                "message": limit_info.message,
                "retry_after": retry_after,
                "limit": limit_info.max_requests,
                "remaining": 0,
                "reset": reset_time
            }

        # Add current request
        limit_info.requests.append(current_time)

        # Return success info
        remaining = limit_info.max_requests - len(limit_info.requests)
        reset_time = current_time + (limit_info.window_ms / 1000)

        return {
            "limited": False,
            "limit": limit_info.max_requests,
            "remaining": remaining,
            "reset": reset_time
        }

    def get_general_limiter(self) -> Callable:
        """Returns the general rate limiter"""
        def limiter(request):
            identifier = self._get_client_ip(request)
            return self._check_limit(identifier, "general", self.general_config)
        return limiter

    def get_strict_limiter(self) -> Callable:
        """Returns the strict rate limiter"""
        def limiter(request):
            identifier = self._get_client_ip(request)
            return self._check_limit(identifier, "strict", self.strict_config)
        return limiter

    def get_auth_limiter(self) -> Callable:
        """Returns the auth rate limiter"""
        def limiter(request):
            identifier = self._get_client_ip(request)
            return self._check_limit(identifier, "auth", self.auth_config)
        return limiter

    def get_api_limiter(self) -> Callable:
        """Returns the API rate limiter"""
        def limiter(request):
            identifier = self._get_client_ip(request)
            return self._check_limit(identifier, "api", self.api_config)
        return limiter

    def create_custom_limiter(self, window_ms: int, max_requests: int, message: str = "Rate limit überschritten") -> Callable:
        """
        Creates a custom rate limiter
        :param window_ms: Time window in milliseconds
        :param max_requests: Maximum number of requests
        :param message: Error message
        :return: Rate limiter function
        """
        config = {
            "window_ms": window_ms,
            "max_requests": max_requests,
            "message": message
        }

        def limiter(request):
            identifier = self._get_client_ip(request)
            # Generate a unique type for this custom limiter
            limit_type = f"custom_{window_ms}_{max_requests}"
            return self._check_limit(identifier, limit_type, config)
        return limiter

class RateLimitingMiddleware:
    def __init__(self):
        """Initialize Rate Limiting Middleware"""
        self.rate_limiter_service = RateLimiterService()

    def general_limiter(self) -> Callable:
        """General rate limiter for API requests"""
        return self.rate_limiter_service.get_general_limiter()

    def strict_limiter(self) -> Callable:
        """Strict rate limiter for sensitive endpoints"""
        return self.rate_limiter_service.get_strict_limiter()

    def auth_limiter(self) -> Callable:
        """Rate limiter for authentication endpoints"""
        return self.rate_limiter_service.get_auth_limiter()

    def api_limiter(self) -> Callable:
        """Rate limiter for API endpoints"""
        return self.rate_limiter_service.get_api_limiter()

    def custom_limiter(self, window_ms: int, max_requests: int, message: str) -> Callable:
        """
        Custom rate limiter
        :param window_ms: Time window in milliseconds
        :param max_requests: Maximum number of requests
        :param message: Error message
        :return: Rate limiter function
        """
        return self.rate_limiter_service.create_custom_limiter(window_ms, max_requests, message)

    def security_headers(self) -> Callable:
        """
        Security headers middleware
        Adds important security headers to all HTTP responses
        """
        def middleware(request, response):
            # Protection against Clickjacking
            response.headers["X-Frame-Options"] = "DENY"

            # XSS protection
            response.headers["X-XSS-Protection"] = "1; mode=block"

            # MIME-type sniffing protection
            response.headers["X-Content-Type-Options"] = "nosniff"

            # Referrer Policy
            response.headers["Referrer-Policy"] = "no-referrer-when-downgrade"

            # Permissions Policy
            response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

            # Content Security Policy (basic)
            response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"

            return response
        return middleware

# Decorator for rate limiting
def rate_limit(limiter_func):
    """
    Decorator for rate limiting endpoints
    :param limiter_func: Rate limiter function
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # In a real implementation, you would get the request object
            # and check the rate limit here
            # For now, we'll just call the function
            return await func(*args, **kwargs)
        return wrapper
    return decorator

if __name__ == "__main__":
    # Example usage
    rate_limiter = RateLimiterService()
    middleware = RateLimitingMiddleware()

    print("Rate Limiter Agent initialized successfully!")

    # Example of checking a limit
    class MockRequest:
        def __init__(self, client_ip="127.0.0.1"):
            self.client_ip = client_ip

    request = MockRequest()

    # Test general limiter
    limiter = rate_limiter.get_general_limiter()
    result = limiter(request)
    print(f"General limit check: {result}")