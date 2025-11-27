from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime, timedelta
import logging
import hashlib
import secrets

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '../../data/billing')
CUSTOMERS_DIR = os.path.join(DATA_DIR, 'customers')
INVOICES_DIR = os.path.join(DATA_DIR, 'invoices')
PAYMENTS_DIR = os.path.join(DATA_DIR, 'payments')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(CUSTOMERS_DIR, exist_ok=True)
os.makedirs(INVOICES_DIR, exist_ok=True)
os.makedirs(PAYMENTS_DIR, exist_ok=True)

# Subscription plans
PLANS = {
    'free': {
        'name': 'Free',
        'price': 0,
        'requestsPerDay': 100,
        'features': ['Basic SEO optimization', 'Limited API access']
    },
    'pro': {
        'name': 'Pro',
        'price': 29.99,
        'requestsPerDay': 1000,
        'features': ['Advanced SEO optimization', 'Full API access', 'Priority support']
    },
    'enterprise': {
        'name': 'Enterprise',
        'price': 99.99,
        'requestsPerDay': 10000,
        'features': ['All Pro features', 'Custom integrations', 'Dedicated support', 'SLA']
    }
}

USAGE_LIMITS = {
    'free': 100,
    'pro': 1000,
    'enterprise': 10000
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Billing Python Agent",
        "version": "1.0.0"
    }), 200

@app.route('/init-db', methods=['POST'])
def init_db():
    """Initialize database"""
    try:
        # In a real implementation, this would initialize the database
        # For now, we'll just ensure directories exist
        os.makedirs(CUSTOMERS_DIR, exist_ok=True)
        os.makedirs(INVOICES_DIR, exist_ok=True)
        os.makedirs(PAYMENTS_DIR, exist_ok=True)

        logger.info("Database initialized")
        return jsonify({
            "success": True,
            "message": "Datenbank erfolgreich initialisiert"
        }), 200
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/create-customer', methods=['POST'])
def create_customer():
    """Create a new customer"""
    try:
        data = request.get_json()

        # Validate input data
        if not data or 'email' not in data:
            return jsonify({
                "success": False,
                "error": "E-Mail ist erforderlich"
            }), 400

        # Create customer object
        customer = {
            'id': generate_customer_id(),
            'email': data['email'],
            'name': data.get('name', ''),
            'plan': data.get('plan', 'free'),
            'subscriptionStatus': 'active',
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'invoices': [],
            'paymentMethods': [],
            'usage': {
                'requestsToday': 0,
                'lastReset': datetime.now().isoformat()
            }
        }

        # Save customer to file
        save_customer(customer)

        logger.info(f"Customer created: {customer['id']}")
        return jsonify({
            "success": True,
            "customer": customer
        }), 201
    except Exception as e:
        logger.error(f"Error creating customer: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/get-customer/<customer_id>', methods=['GET'])
def get_customer(customer_id):
    """Get customer by ID"""
    try:
        customer = load_customer(customer_id)
        if not customer:
            return jsonify({
                "success": False,
                "error": "Kunde nicht gefunden"
            }), 404

        logger.info(f"Customer retrieved: {customer_id}")
        return jsonify({
            "success": True,
            "customer": customer
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving customer: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/update-subscription/<customer_id>', methods=['POST'])
def update_subscription(customer_id):
    """Update customer subscription"""
    try:
        data = request.get_json()

        # Validate input data
        if not data or 'plan' not in data:
            return jsonify({
                "success": False,
                "error": "Plan ist erforderlich"
            }), 400

        # Load customer
        customer = load_customer(customer_id)
        if not customer:
            return jsonify({
                "success": False,
                "error": "Kunde nicht gefunden"
            }), 404

        # Update subscription
        customer['plan'] = data['plan']
        customer['updatedAt'] = datetime.now().isoformat()

        # Save updated customer
        save_customer(customer)

        logger.info(f"Subscription updated for customer: {customer_id}")
        return jsonify({
            "success": True,
            "customer": customer
        }), 200
    except Exception as e:
        logger.error(f"Error updating subscription: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/track-usage/<customer_id>', methods=['POST'])
def track_usage(customer_id):
    """Track API usage for a customer"""
    try:
        data = request.get_json()

        # Load customer
        customer = load_customer(customer_id)
        if not customer:
            return jsonify({
                "success": False,
                "error": "Kunde nicht gefunden"
            }), 404

        # Reset usage counter if needed (daily reset)
        last_reset = datetime.fromisoformat(customer['usage']['lastReset'])
        if datetime.now().date() > last_reset.date():
            customer['usage']['requestsToday'] = 0
            customer['usage']['lastReset'] = datetime.now().isoformat()

        # Increment usage
        customer['usage']['requestsToday'] += data.get('requests', 1)
        customer['updatedAt'] = datetime.now().isoformat()

        # Save updated customer
        save_customer(customer)

        # Check if usage limit is exceeded
        limit = USAGE_LIMITS.get(customer['plan'], 100)
        exceeded = customer['usage']['requestsToday'] > limit

        logger.info(f"Usage tracked for customer: {customer_id}")
        return jsonify({
            "success": True,
            "usage": customer['usage'],
            "limit": limit,
            "exceeded": exceeded
        }), 200
    except Exception as e:
        logger.error(f"Error tracking usage: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/create-invoice/<customer_id>', methods=['POST'])
def create_invoice(customer_id):
    """Create invoice for customer"""
    try:
        data = request.get_json()

        # Load customer
        customer = load_customer(customer_id)
        if not customer:
            return jsonify({
                "success": False,
                "error": "Kunde nicht gefunden"
            }), 404

        # Create invoice object
        invoice = {
            'id': generate_invoice_id(),
            'customerId': customer_id,
            'amount': data['amount'],
            'currency': data.get('currency', 'EUR'),
            'description': data.get('description', ''),
            'status': 'pending',
            'createdAt': datetime.now().isoformat(),
            'dueDate': (datetime.now() + timedelta(days=30)).isoformat()
        }

        # Save invoice
        save_invoice(invoice)

        # Add invoice to customer
        customer['invoices'].append(invoice['id'])
        customer['updatedAt'] = datetime.now().isoformat()
        save_customer(customer)

        logger.info(f"Invoice created: {invoice['id']}")
        return jsonify({
            "success": True,
            "invoice": invoice
        }), 201
    except Exception as e:
        logger.error(f"Error creating invoice: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/process-payment/<customer_id>', methods=['POST'])
def process_payment(customer_id):
    """Process payment for customer"""
    try:
        data = request.get_json()

        # Load customer
        customer = load_customer(customer_id)
        if not customer:
            return jsonify({
                "success": False,
                "error": "Kunde nicht gefunden"
            }), 404

        # Validate payment method
        if 'paymentMethodId' not in data:
            return jsonify({
                "success": False,
                "error": "Zahlungsmethode ist erforderlich"
            }), 400

        # Find payment method
        payment_method = None
        for method in customer['paymentMethods']:
            if method['id'] == data['paymentMethodId']:
                payment_method = method
                break

        if not payment_method:
            return jsonify({
                "success": False,
                "error": "Zahlungsmethode nicht gefunden"
            }), 404

        # Create payment object
        payment = {
            'id': generate_payment_id(),
            'customerId': customer_id,
            'amount': data['amount'],
            'currency': data.get('currency', 'EUR'),
            'paymentMethodId': data['paymentMethodId'],
            'paymentMethodType': payment_method['type'],
            'status': 'succeeded',
            'processedAt': datetime.now().isoformat()
        }

        # Save payment
        save_payment(payment)

        logger.info(f"Payment processed: {payment['id']}")
        return jsonify({
            "success": True,
            "payment": payment
        }), 200
    except Exception as e:
        logger.error(f"Error processing payment: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/get-plans', methods=['GET'])
def get_plans():
    """Get available subscription plans"""
    return jsonify({
        "success": True,
        "plans": PLANS
    }), 200

# Helper functions
def generate_customer_id():
    """Generate unique customer ID"""
    return 'customer_' + secrets.token_hex(16)

def generate_invoice_id():
    """Generate unique invoice ID"""
    return 'invoice_' + secrets.token_hex(16)

def generate_payment_id():
    """Generate unique payment ID"""
    return 'payment_' + secrets.token_hex(16)

def save_customer(customer):
    """Save customer to file"""
    try:
        customer_path = os.path.join(CUSTOMERS_DIR, f"{customer['id']}.json")
        with open(customer_path, 'w') as f:
            json.dump(customer, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving customer: {str(e)}")
        raise

def load_customer(customer_id):
    """Load customer from file"""
    try:
        customer_path = os.path.join(CUSTOMERS_DIR, f"{customer_id}.json")
        if not os.path.exists(customer_path):
            return None
        with open(customer_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading customer: {str(e)}")
        return None

def save_invoice(invoice):
    """Save invoice to file"""
    try:
        invoice_path = os.path.join(INVOICES_DIR, f"{invoice['id']}.json")
        with open(invoice_path, 'w') as f:
            json.dump(invoice, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving invoice: {str(e)}")
        raise

def save_payment(payment):
    """Save payment to file"""
    try:
        payment_path = os.path.join(PAYMENTS_DIR, f"{payment['id']}.json")
        with open(payment_path, 'w') as f:
            json.dump(payment, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving payment: {str(e)}")
        raise

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)