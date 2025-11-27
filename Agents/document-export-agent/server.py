#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Document Export Agent Server
HTTP server for document export functionality
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

from app import DocumentExportAgent

class DocumentExportHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.document_export_agent = DocumentExportAgent()
        super().__init__(*args, **kwargs)
    
    def do_POST(self):
        """Handle POST requests"""
        try:
            # Get request data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Route based on path
            if self.path == '/export':
                asyncio.run(self.handle_export(data))
            else:
                self.send_error(404, "Endpoint not found")
                
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
        except Exception as e:
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def do_GET(self):
        """Handle GET requests"""
        try:
            if self.path.startswith('/export-history'):
                document_id = None
                if '?' in self.path:
                    query_params = self.path.split('?')[1]
                    if 'document_id=' in query_params:
                        document_id = query_params.split('document_id=')[1]
                asyncio.run(self.handle_get_export_history(document_id))
            else:
                self.send_error(404, "Endpoint not found")
        except Exception as e:
            self.send_error(500, f"Internal server error: {str(e)}")
    
    async def handle_export(self, data: Dict[str, Any]):
        """Handle document export request"""
        document_id = data.get('document_id')
        format_type = data.get('format')
        options = data.get('options', {})
        
        result = await self.document_export_agent.export_document(document_id, format_type, options)
        
        self.send_response(200 if result.get('success') else 500)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        response = json.dumps(result, indent=2, ensure_ascii=False)
        self.wfile.write(response.encode('utf-8'))
    
    async def handle_get_export_history(self, document_id: str = None):
        """Handle get export history request"""
        result = await self.document_export_agent.get_export_history(document_id)
        
        self.send_response(200 if result.get('success') else 500)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        response = json.dumps(result, indent=2, ensure_ascii=False)
        self.wfile.write(response.encode('utf-8'))

def run_server(port: int = 8000):
    """Run the document export server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, DocumentExportHandler)
    print(f"Document Export Agent Server running on port {port}")
    httpd.serve_forever()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run_server(port)