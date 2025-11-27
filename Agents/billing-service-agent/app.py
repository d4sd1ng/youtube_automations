#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Billing Service Agent
Service for billing and monetization
"""

import os
import json
import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from pathlib import Path
from cryptography.fernet import Fernet

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BillingServiceAgent:
    def __init__(self):
        # Subscription plans
        self.plans = {
            "free": {
                "name": "Free",
                "price": 0,
                "requests_per_day": 100,
                "features": ["Basic SEO optimization", "Limited API access"]
            },
            "pro": {
                "name": "Pro",
                "price": 29.99,
                "requests_per_day": 1000,
                "features": ["Advanced SEO optimization", "Full API access", "Priority support"]
            },
            "enterprise": {
                "name": "Enterprise",
                "price": 99.99,
                "requests_per_day": 10000,
                "features": ["All Pro features", "Custom integrations", "Dedicated support", "SLA"]
            }
        }
        
        # Usage limits
        self.usage_limits = {
            "free": 100,
            "pro": 1000,
            "enterprise": 10000
        }
        
        # Data directory
        self.data_dir = Path(__file__).parent / "data"
        self.data_dir.mkdir(exist_ok=True)
        
        # Customers file
        self.customers_file = self.data_dir / "customers.json"
        self.invoices_file = self.data_dir / "invoices.json"
        self.payments_file = self.data_dir / "payments.json"
        
        # Initialize data files if they don't exist
        if not self.customers_file.exists():
            with open(self.customers_file, 'w') as f:
                json.dump([], f)
                
        if not self.invoices_file.exists():
            with open(self.invoices_file, 'w') as f:
                json.dump([], f)
                
        if not self.payments_file.exists():
            with open(self.payments_file, 'w') as f:
                json.dump([], f)
    
    def _load_customers(self) -> list:
        """Load customers from file"""
        try:
            with open(self.customers_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading customers: {str(e)}")
            return []
    
    def _save_customers(self, customers: list) -> bool:
        """Save customers to file"""
        try:
            with open(self.customers_file, 'w') as f:
                json.dump(customers, f, indent=2)
            return True
        except Exception as e:
            logger.error(f"Error saving customers: {str(e)}")
            return False
    
    def _load_invoices(self) -> list:
        """Load invoices from file"""
        try:
            with open(self.invoices_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading invoices: {str(e)}")
            return []
    
    def _save_invoices(self, invoices: list) -> bool:
        """Save invoices to file"""
        try:
            with open(self.invoices_file, 'w') as f:
                json.dump(invoices, f, indent=2)
            return True
        except Exception as e:
            logger.error(f"Error saving invoices: {str(e)}")
            return False
    
    def _load_payments(self) -> list:
        """Load payments from file"""
        try:
            with open(self.payments_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading payments: {str(e)}")
            return []
    
    def _save_payments(self, payments: list) -> bool:
        """Save payments to file"""
        try:
            with open(self.payments_file, 'w') as f:
                json.dump(payments, f, indent=2)
            return True
        except Exception as e:
            logger.error(f"Error saving payments: {str(e)}")
            return False
    
    def create_customer(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new customer
        
        Args:
            customer_data (Dict[str, Any]): Customer data
            
        Returns:
            Dict[str, Any]: Customer information
        """
        try:
            customers = self._load_customers()
            
            # Check if customer already exists
            existing_customer = next((c for c in customers if c.get("email") == customer_data.get("email")), None)
            if existing_customer:
                return {
                    "success": False,
                    "error": "Customer with this email already exists"
                }
            
            # Create customer object
            customer = {
                "id": self._generate_customer_id(),
                "email": customer_data.get("email"),
                "name": customer_data.get("name"),
                "subscription": {
                    "plan": "free",
                    "start_date": datetime.now().isoformat(),
                    "end_date": None,
                    "status": "active"
                },
                "usage": {
                    "current_day": datetime.now().strftime("%Y-%m-%d"),
                    "requests": 0,
                    "limit": self.usage_limits["free"]
                },
                "payment_methods": [],
                "invoices": [],
                "created_at": datetime.now().isoformat()
            }
            
            # Save customer to database
            customers.append(customer)
            if self._save_customers(customers):
                return {
                    "success": True,
                    "customer": customer
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to save customer"
                }
                
        except Exception as e:
            logger.error(f"Error creating customer: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def add_payment_method(self, customer_id: str, payment_method: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a payment method to a customer
        
        Args:
            customer_id (str): Customer ID
            payment_method (Dict[str, Any]): Payment method data (tokenized)
            
        Returns:
            Dict[str, Any]: Updated customer information
        """
        try:
            customers = self._load_customers()
            
            # Find customer
            customer = next((c for c in customers if c.get("id") == customer_id), None)
            if not customer:
                return {
                    "success": False,
                    "error": "Customer not found"
                }
            
            # Create payment method object (without sensitive data)
            payment_method_obj = {
                "id": self._generate_payment_method_id(),
                "type": payment_method.get("type"),  # e.g. 'card', 'paypal'
                # Sensitive data like credit card numbers are NEVER stored
                # Instead, we use tokenized references to external payment providers
                "last4": payment_method.get("last4"),  # Last 4 digits for display
                "brand": payment_method.get("brand"),  # Card brand
                "exp_month": payment_method.get("exp_month"),
                "exp_year": payment_method.get("exp_year"),
                "external_id": payment_method.get("external_id"),  # Reference to external payment provider
                "is_default": len(customer["payment_methods"]) == 0  # First method is default
            }
            
            # Add payment method to customer
            customer["payment_methods"].append(payment_method_obj)
            
            # Save updated customer
            if self._save_customers(customers):
                return {
                    "success": True,
                    "customer": customer
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to save customer"
                }
                
        except Exception as e:
            logger.error(f"Error adding payment method: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def set_default_payment_method(self, customer_id: str, payment_method_id: str) -> Dict[str, Any]:
        """
        Set a payment method as default
        
        Args:
            customer_id (str): Customer ID
            payment_method_id (str): Payment method ID
            
        Returns:
            Dict[str, Any]: Updated customer information
        """
        try:
            customers = self._load_customers()
            
            # Find customer
            customer = next((c for c in customers if c.get("id") == customer_id), None)
            if not customer:
                return {
                    "success": False,
                    "error": "Customer not found"
                }
            
            # Update payment methods
            for method in customer["payment_methods"]:
                method["is_default"] = method["id"] == payment_method_id
            
            # Save updated customer
            if self._save_customers(customers):
                return {
                    "success": True,
                    "customer": customer
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to save customer"
                }
                
        except Exception as e:
            logger.error(f"Error setting default payment method: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def remove_payment_method(self, customer_id: str, payment_method_id: str) -> Dict[str, Any]:
        """
        Remove a payment method from a customer
        
        Args:
            customer_id (str): Customer ID
            payment_method_id (str): Payment method ID
            
        Returns:
            Dict[str, Any]: Updated customer information
        """
        try:
            customers = self._load_customers()
            
            # Find customer
            customer = next((c for c in customers if c.get("id") == customer_id), None)
            if not customer:
                return {
                    "success": False,
                    "error": "Customer not found"
                }
            
            # Check if method exists
            payment_method_exists = any(method["id"] == payment_method_id for method in customer["payment_methods"])
            if not payment_method_exists:
                return {
                    "success": False,
                    "error": "Payment method not found"
                }
            
            # Check if it's the last method
            if len(customer["payment_methods"]) <= 1:
                return {
                    "success": False,
                    "error": "At least one payment method is required"
                }
            
            # Remove payment method
            customer["payment_methods"] = [method for method in customer["payment_methods"] if method["id"] != payment_method_id]
            
            # Save updated customer
            if self._save_customers(customers):
                return {
                    "success": True,
                    "customer": customer
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to save customer"
                }
                
        except Exception as e:
            logger.error(f"Error removing payment method: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def update_subscription(self, customer_id: str, plan: str) -> Dict[str, Any]:
        """
        Update a customer's subscription
        
        Args:
            customer_id (str): Customer ID
            plan (str): New plan
            
        Returns:
            Dict[str, Any]: Updated subscription information
        """
        try:
            if plan not in self.plans:
                return {
                    "success": False,
                    "error": "Invalid plan"
                }
            
            customers = self._load_customers()
            
            # Find customer
            customer = next((c for c in customers if c.get("id") == customer_id), None)
            if not customer:
                return {
                    "success": False,
                    "error": "Customer not found"
                }
            
            # Update subscription
            subscription = {
                "plan": plan,
                "start_date": datetime.now().isoformat(),
                "end_date": None,
                "status": "active"
            }
            
            # Update usage limit
            usage = {
                "current_day": customer["usage"]["current_day"],
                "requests": customer["usage"]["requests"],
                "limit": self.usage_limits[plan]
            }
            
            # Update customer
            customer["subscription"] = subscription
            customer["usage"] = usage
            
            # Save updated customer
            if self._save_customers(customers):
                return {
                    "success": True,
                    "subscription": subscription
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to save customer"
                }
                
        except Exception as e:
            logger.error(f"Error updating subscription: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def check_usage_limit(self, customer_id: str) -> Dict[str, Any]:
        """
        Check a customer's usage limit
        
        Args:
            customer_id (str): Customer ID
            
        Returns:
            Dict[str, Any]: Usage information
        """
        try:
            customers = self._load_customers()
            
            # Find customer
            customer = next((c for c in customers if c.get("id") == customer_id), None)
            if not customer:
                return {
                    "success": False,
                    "error": "Customer not found"
                }
            
            today = datetime.now().strftime("%Y-%m-%d")
            
            # Reset usage counter if it's a new day
            if customer["usage"]["current_day"] != today:
                customer["usage"] = {
                    "current_day": today,
                    "requests": 0,
                    "limit": customer["usage"]["limit"]
                }
                
                # Save updated customer
                self._save_customers(customers)
            
            usage_info = {
                "current": customer["usage"]["requests"],
                "limit": customer["usage"]["limit"],
                "remaining": customer["usage"]["limit"] - customer["usage"]["requests"],
                "reset_date": today
            }
            
            return {
                "success": True,
                "usage": usage_info,
                "is_over_limit": customer["usage"]["requests"] >= customer["usage"]["limit"]
            }
                
        except Exception as e:
            logger.error(f"Error checking usage limit: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def increment_usage(self, customer_id: str) -> Dict[str, Any]:
        """
        Increment a customer's usage counter
        
        Args:
            customer_id (str): Customer ID
            
        Returns:
            Dict[str, Any]: Updated usage information
        """
        try:
            # Check usage
            usage_check = self.check_usage_limit(customer_id)
            
            if not usage_check["success"]:
                return usage_check
            
            if usage_check["is_over_limit"]:
                return {
                    "success": False,
                    "error": "Usage limit reached"
                }
            
            customers = self._load_customers()
            
            # Find customer
            customer = next((c for c in customers if c.get("id") == customer_id), None)
            if not customer:
                return {
                    "success": False,
                    "error": "Customer not found"
                }
            
            # Increment usage counter
            new_requests = customer["usage"]["requests"] + 1
            new_usage = {
                "current_day": customer["usage"]["current_day"],
                "requests": new_requests,
                "limit": customer["usage"]["limit"]
            }
            
            # Update customer
            customer["usage"] = new_usage
            
            # Save updated customer
            if self._save_customers(customers):
                usage_info = {
                    "current": new_requests,
                    "limit": customer["usage"]["limit"],
                    "remaining": customer["usage"]["limit"] - new_requests,
                    "reset_date": customer["usage"]["current_day"]
                }
                
                return {
                    "success": True,
                    "usage": usage_info,
                    "is_over_limit": new_requests >= customer["usage"]["limit"]
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to save customer"
                }
                
        except Exception as e:
            logger.error(f"Error incrementing usage: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def create_invoice(self, customer_id: str, invoice_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create an invoice for a customer
        
        Args:
            customer_id (str): Customer ID
            invoice_data (Dict[str, Any]): Invoice data
            
        Returns:
            Dict[str, Any]: Invoice information
        """
        try:
            customers = self._load_customers()
            
            # Find customer
            customer = next((c for c in customers if c.get("id") == customer_id), None)
            if not customer:
                return {
                    "success": False,
                    "error": "Customer not found"
                }
            
            # Create invoice object
            invoice = {
                "id": self._generate_invoice_id(),
                "customer_id": customer_id,
                "amount": invoice_data.get("amount"),
                "currency": invoice_data.get("currency", "EUR"),
                "description": invoice_data.get("description"),
                "status": "pending",
                "created_at": datetime.now().isoformat(),
                "due_date": (datetime.now() + timedelta(days=30)).isoformat()  # 30 days in the future
            }
            
            # Save invoice to database
            invoices = self._load_invoices()
            invoices.append(invoice)
            if not self._save_invoices(invoices):
                return {
                    "success": False,
                    "error": "Failed to save invoice"
                }
            
            # Add invoice to customer's invoice list
            customer["invoices"].append(invoice["id"])
            if not self._save_customers(customers):
                return {
                    "success": False,
                    "error": "Failed to update customer"
                }
            
            return {
                "success": True,
                "invoice": invoice
            }
                
        except Exception as e:
            logger.error(f"Error creating invoice: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def process_payment(self, customer_id: str, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a payment
        
        Args:
            customer_id (str): Customer ID
            payment_data (Dict[str, Any]): Payment data
            
        Returns:
            Dict[str, Any]: Payment information
        """
        try:
            customers = self._load_customers()
            
            # Find customer
            customer = next((c for c in customers if c.get("id") == customer_id), None)
            if not customer:
                return {
                    "success": False,
                    "error": "Customer not found"
                }
            
            # Check if payment method is specified
            if not payment_data.get("payment_method_id"):
                return {
                    "success": False,
                    "error": "Payment method is required"
                }
            
            # Find payment method
            payment_method = next((method for method in customer["payment_methods"] if method["id"] == payment_data["payment_method_id"]), None)
            if not payment_method:
                return {
                    "success": False,
                    "error": "Payment method not found"
                }
            
            # Create payment object (without sensitive data)
            payment = {
                "id": self._generate_payment_id(),
                "customer_id": customer_id,
                "amount": payment_data.get("amount"),
                "currency": payment_data.get("currency", "EUR"),
                "payment_method_id": payment_data.get("payment_method_id"),
                "payment_method_type": payment_method["type"],
                "status": "succeeded",
                "processed_at": datetime.now().isoformat()
            }
            
            # Save payment to database
            payments = self._load_payments()
            payments.append(payment)
            if not self._save_payments(payments):
                return {
                    "success": False,
                    "error": "Failed to save payment"
                }
            
            return {
                "success": True,
                "payment": payment
            }
                
        except Exception as e:
            logger.error(f"Error processing payment: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_customer_by_id(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """
        Find a customer by ID
        
        Args:
            customer_id (str): Customer ID
            
        Returns:
            Optional[Dict[str, Any]]: Customer object or None
        """
        try:
            customers = self._load_customers()
            customer = next((c for c in customers if c.get("id") == customer_id), None)
            return customer
        except Exception as e:
            logger.error(f"Error getting customer by ID: {str(e)}")
            return None
    
    def _generate_customer_id(self) -> str:
        """Generate a unique customer ID"""
        return f"customer_{uuid.uuid4().hex}"
    
    def _generate_invoice_id(self) -> str:
        """Generate a unique invoice ID"""
        return f"invoice_{uuid.uuid4().hex}"
    
    def _generate_payment_id(self) -> str:
        """Generate a unique payment ID"""
        return f"payment_{uuid.uuid4().hex}"
    
    def _generate_payment_method_id(self) -> str:
        """Generate a unique payment method ID"""
        return f"pm_{uuid.uuid4().hex}"
    
    def get_plans(self) -> Dict[str, Any]:
        """Get available subscription plans"""
        return self.plans

# Main execution
if __name__ == "__main__":
    agent = BillingServiceAgent()
    print("Billing Service Agent initialized")