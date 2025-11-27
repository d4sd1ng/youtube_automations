#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Rate Limiter Agent Server
HTTP server for rate limiting functionality
"""

import os
import sys
import json
import asyncio
from pathlib import Path
from typing import Dict, Any
from http.server import HTTPServer, BaseHTTPRequestHandler

# Add parent directory to path to import app modules
sys.path.append(str(Path(__file__).parent))

from app import RateLimiterAgent

class RateLimiterHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.rate_limiter_agent = RateLimiterAgent()
        super().__init__(*args, **kwargs)
    
    def do_POST(self):
        """Handle POST requests"""
        try:
            # Get request data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Get client IP
            client_ip = self.client_address[0]
            if 'X-Forwarded-For' in self.headers:
                client_ip = self.headers['X-Forwarded-For'].split(',')[0].strip()
            
            # Route based on path
            if self.path == '/check':
                limit_type = data.get('limit_type', 'general')
                result = self.rate_limiter_agent.check_rate_limit(client_ip, limit_type)
                self.send_response(200 if result.get('allowed', True) else 429)
            elif self.path == '/custom':
                window_ms = data.get('window_ms')
                max_requests = data.get('max_requests')
                message = data.get('message', 'Rate limit überschritten')
                result = self.rate_limiter_agent.create_custom_limiter(client_ip, window_ms, max_requests, message)
                self.send_response(200 if result.get('allowed', True) else 429)
            elif self.path == '/reset':
                success = self.rate_limiter_agent.reset_ip_limits(client_ip)
                result = {"success": success}
                self.send_response(200)
            else:
                self.send_error(404, "Endpoint not found")
                return
                
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = json.dumps(result, indent=2, ensure_ascii=False)
            self.wfile.write(response.encode('utf-8'))
                
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
        except Exception as e:
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def do_GET(self):
        """Handle GET requests"""
        try:
            if self.path == '/stats':
                result = self.rate_limiter_agent.get_stats()
                self.send_response(200)
            else:
                self.send_error(404, "Endpoint not found")
                return
                
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = json.dumps(result, indent=2, ensure_ascii=False)
            self.wfile.write(response.encode('utf-8'))
        except Exception as e:
            self.send_error(500, f"Internal server error: {str(e)}")

def run_server(port: int = 8000):
    """Run the rate limiter server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, RateLimiterHandler)
    print(f"Rate Limiter Agent Server running on port {port}")
    httpd.serve_forever()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run_server(port)