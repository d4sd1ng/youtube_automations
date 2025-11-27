#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Billing Service Agent Server
HTTP server for billing and monetization functionality
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

from app import BillingServiceAgent

class BillingServiceHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.billing_service_agent = BillingServiceAgent()
        super().__init__(*args, **kwargs)
    
    def do_POST(self):
        """Handle POST requests"""
        try:
            # Get request data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Route based on path
            if self.path == '/create-customer':
                result = self.billing_service_agent.create_customer(data)
                self.send_response(200 if result.get('success') else 400)
            elif self.path == '/add-payment-method':
                customer_id = data.get('customer_id')
                payment_method = data.get('payment_method')
                result = self.billing_service_agent.add_payment_method(customer_id, payment_method)
                self.send_response(200 if result.get('success') else 400)
            elif self.path == '/set-default-payment-method':
                customer_id = data.get('customer_id')
                payment_method_id = data.get('payment_method_id')
                result = self.billing_service_agent.set_default_payment_method(customer_id, payment_method_id)
                self.send_response(200 if result.get('success') else 400)
            elif self.path == '/remove-payment-method':
                customer_id = data.get('customer_id')
                payment_method_id = data.get('payment_method_id')
                result = self.billing_service_agent.remove_payment_method(customer_id, payment_method_id)
                self.send_response(200 if result.get('success') else 400)
            elif self.path == '/update-subscription':
                customer_id = data.get('customer_id')
                plan = data.get('plan')
                result = self.billing_service_agent.update_subscription(customer_id, plan)
                self.send_response(200 if result.get('success') else 400)
            elif self.path == '/increment-usage':
                customer_id = data.get('customer_id')
                result = self.billing_service_agent.increment_usage(customer_id)
                self.send_response(200 if result.get('success') else 400)
            elif self.path == '/create-invoice':
                customer_id = data.get('customer_id')
                invoice_data = data.get('invoice_data')
                result = self.billing_service_agent.create_invoice(customer_id, invoice_data)
                self.send_response(200 if result.get('success') else 400)
            elif self.path == '/process-payment':
                customer_id = data.get('customer_id')
                payment_data = data.get('payment_data')
                result = self.billing_service_agent.process_payment(customer_id, payment_data)
                self.send_response(200 if result.get('success') else 400)
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
            if self.path == '/plans':
                result = self.billing_service_agent.get_plans()
                self.send_response(200)
            elif self.path.startswith('/customer/'):
                customer_id = self.path.split('/')[-1]
                result = self.billing_service_agent.get_customer_by_id(customer_id)
                if result:
                    self.send_response(200)
                else:
                    self.send_response(404)
                    result = {"error": "Customer not found"}
            elif self.path.startswith('/check-usage/'):
                customer_id = self.path.split('/')[-1]
                result = self.billing_service_agent.check_usage_limit(customer_id)
                self.send_response(200 if result.get('success') else 400)
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
    """Run the billing service server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, BillingServiceHandler)
    print(f"Billing Service Agent Server running on port {port}")
    httpd.serve_forever()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run_server(port)