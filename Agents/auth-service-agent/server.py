#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Auth Service Agent Server
HTTP server for authentication and authorization
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

from app import AuthServiceAgent

class AuthServiceHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.auth_service = AuthServiceAgent()
        super().__init__(*args, **kwargs)
    
    def do_POST(self):
        """Handle POST requests"""
        try:
            # Get request data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Route based on path
            if self.path == '/register':
                response = asyncio.run(self.auth_service.register_user(data))
                self.send_response(200)
            elif self.path == '/login':
                response = asyncio.run(self.auth_service.authenticate_user(
                    data.get('email', ''), 
                    data.get('password', '')
                ))
                self.send_response(200)
            elif self.path == '/validate-token':
                response = self.auth_service.validate_token(data.get('token', ''))
                self.send_response(200)
            elif self.path == '/validate-api-key':
                response = asyncio.run(self.auth_service.validate_api_key(data.get('api_key', '')))
                self.send_response(200)
            else:
                self.send_response(404)
                response = {"error": "Endpoint not found"}
            
            # Send response
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as error:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"error": str(error)}
            self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"status": "healthy", "service": "auth-service-agent"}
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"error": "Endpoint not found"}
            self.wfile.write(json.dumps(response).encode('utf-8'))

def run_server(host="localhost", port=8000):
    """Run the HTTP server"""
    server_address = (host, port)
    httpd = HTTPServer(server_address, AuthServiceHandler)
    print(f"🌐 Auth Service Agent server running on http://{host}:{port}")
    httpd.serve_forever()

if __name__ == "__main__":
    # Get port from environment variable or default to 8000
    port = int(os.environ.get("PORT", 8000))
    run_server(port=port)