#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Thumbnail Generation Agent Server
HTTP server for thumbnail generation functionality
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

from app import ThumbnailGenerationAgent

class ThumbnailGenerationHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.thumbnail_generation_agent = ThumbnailGenerationAgent()
        super().__init__(*args, **kwargs)
    
    def do_POST(self):
        """Handle POST requests"""
        try:
            # Get request data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Route based on path
            if self.path == '/generate':
                result = self.thumbnail_generation_agent.generate_thumbnail(data)
                self.send_response(200 if result.get('success') else 400)
            elif self.path == '/update-config':
                new_config = data.get('config', {})
                self.thumbnail_generation_agent.update_config(new_config)
                result = {"success": True, "message": "Configuration updated"}
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
            if self.path == '/templates':
                result = self.thumbnail_generation_agent.get_available_templates()
                self.send_response(200)
            elif self.path == '/config':
                result = self.thumbnail_generation_agent.get_config()
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
    """Run the thumbnail generation server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, ThumbnailGenerationHandler)
    print(f"Thumbnail Generation Agent Server running on port {port}")
    httpd.serve_forever()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run_server(port)