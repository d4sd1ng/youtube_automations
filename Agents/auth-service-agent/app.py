from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime, timedelta
import logging
import hashlib
import secrets
import jwt

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '../../data/auth')
USERS_DIR = os.path.join(DATA_DIR, 'users')
SESSIONS_DIR = os.path.join(DATA_DIR, 'sessions')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(USERS_DIR, exist_ok=True)
os.makedirs(SESSIONS_DIR, exist_ok=True)

# JWT secret key (in production, use environment variable)
JWT_SECRET = os.environ.get('JWT_SECRET', 'your_jwt_secret_here')

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Auth Python Agent",
        "version": "1.0.0"
    }), 200

@app.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()

        # Validate input data
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({
                "success": False,
                "error": "E-Mail und Passwort sind erforderlich"
            }), 400

        # Check if user already exists
        if user_exists(data['email']):
            return jsonify({
                "success": False,
                "error": "Benutzer existiert bereits"
            }), 409

        # Create user object
        user = {
            'id': generate_user_id(),
            'email': data['email'],
            'password': hash_password(data['password']),
            'name': data.get('name', ''),
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'isActive': True,
            'roles': data.get('roles', ['user'])
        }

        # Save user to file
        save_user(user)

        logger.info(f"User registered: {user['id']}")
        return jsonify({
            "success": True,
            "user": {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'createdAt': user['createdAt'],
                'isActive': user['isActive'],
                'roles': user['roles']
            }
        }), 201
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()

        # Validate input data
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({
                "success": False,
                "error": "E-Mail und Passwort sind erforderlich"
            }), 400

        # Find user
        user = find_user_by_email(data['email'])
        if not user:
            return jsonify({
                "success": False,
                "error": "Ungültige Anmeldeinformationen"
            }), 401

        # Check password
        if not verify_password(data['password'], user['password']):
            return jsonify({
                "success": False,
                "error": "Ungültige Anmeldeinformationen"
            }), 401

        # Check if user is active
        if not user['isActive']:
            return jsonify({
                "success": False,
                "error": "Benutzerkonto ist deaktiviert"
            }), 401

        # Create session
        session = {
            'id': generate_session_id(),
            'userId': user['id'],
            'createdAt': datetime.now().isoformat(),
            'expiresAt': (datetime.now() + timedelta(days=7)).isoformat()
        }

        # Save session
        save_session(session)

        # Generate JWT token
        token = jwt.encode({
            'userId': user['id'],
            'email': user['email'],
            'roles': user['roles'],
            'exp': datetime.now() + timedelta(days=7)
        }, JWT_SECRET, algorithm='HS256')

        logger.info(f"User logged in: {user['id']}")
        return jsonify({
            "success": True,
            "token": token,
            "user": {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'roles': user['roles']
            }
        }), 200
    except Exception as e:
        logger.error(f"Error logging in user: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/logout', methods=['POST'])
def logout():
    """Logout user"""
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                "success": False,
                "error": "Kein gültiger Token gefunden"
            }), 401

        token = auth_header.split(' ')[1]

        # Decode token to get user ID
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            user_id = payload['userId']
        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "error": "Token abgelaufen"
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                "success": False,
                "error": "Ungültiger Token"
            }), 401

        # Invalidate session
        invalidate_session_by_user_id(user_id)

        logger.info(f"User logged out: {user_id}")
        return jsonify({
            "success": True,
            "message": "Erfolgreich abgemeldet"
        }), 200
    except Exception as e:
        logger.error(f"Error logging out user: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/validate-token', methods=['POST'])
def validate_token():
    """Validate JWT token"""
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                "success": False,
                "error": "Kein gültiger Token gefunden"
            }), 401

        token = auth_header.split(' ')[1]

        # Decode token
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            return jsonify({
                "success": True,
                "payload": payload
            }), 200
        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "error": "Token abgelaufen"
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                "success": False,
                "error": "Ungültiger Token"
            }), 401
    except Exception as e:
        logger.error(f"Error validating token: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/change-password', methods=['POST'])
def change_password():
    """Change user password"""
    try:
        data = request.get_json()

        # Validate input data
        if not data or 'email' not in data or 'oldPassword' not in data or 'newPassword' not in data:
            return jsonify({
                "success": False,
                "error": "E-Mail, altes Passwort und neues Passwort sind erforderlich"
            }), 400

        # Find user
        user = find_user_by_email(data['email'])
        if not user:
            return jsonify({
                "success": False,
                "error": "Benutzer nicht gefunden"
            }), 404

        # Check old password
        if not verify_password(data['oldPassword'], user['password']):
            return jsonify({
                "success": False,
                "error": "Altes Passwort ist falsch"
            }), 401

        # Update password
        user['password'] = hash_password(data['newPassword'])
        user['updatedAt'] = datetime.now().isoformat()
        save_user(user)

        logger.info(f"Password changed for user: {user['id']}")
        return jsonify({
            "success": True,
            "message": "Passwort erfolgreich geändert"
        }), 200
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Helper functions
def generate_user_id():
    """Generate unique user ID"""
    return 'user_' + secrets.token_hex(16)

def generate_session_id():
    """Generate unique session ID"""
    return 'session_' + secrets.token_hex(16)

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed_password):
    """Verify password against hash"""
    return hash_password(password) == hashed_password

def user_exists(email):
    """Check if user exists"""
    for filename in os.listdir(USERS_DIR):
        if filename.endswith('.json'):
            with open(os.path.join(USERS_DIR, filename), 'r') as f:
                user = json.load(f)
                if user['email'] == email:
                    return True
    return False

def find_user_by_email(email):
    """Find user by email"""
    for filename in os.listdir(USERS_DIR):
        if filename.endswith('.json'):
            with open(os.path.join(USERS_DIR, filename), 'r') as f:
                user = json.load(f)
                if user['email'] == email:
                    return user
    return None

def save_user(user):
    """Save user to file"""
    try:
        user_path = os.path.join(USERS_DIR, f"{user['id']}.json")
        with open(user_path, 'w') as f:
            json.dump(user, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving user: {str(e)}")
        raise

def save_session(session):
    """Save session to file"""
    try:
        session_path = os.path.join(SESSIONS_DIR, f"{session['id']}.json")
        with open(session_path, 'w') as f:
            json.dump(session, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving session: {str(e)}")
        raise

def invalidate_session_by_user_id(user_id):
    """Invalidate session by user ID"""
    try:
        for filename in os.listdir(SESSIONS_DIR):
            if filename.endswith('.json'):
                session_path = os.path.join(SESSIONS_DIR, filename)
                with open(session_path, 'r') as f:
                    session = json.load(f)
                    if session['userId'] == user_id:
                        os.remove(session_path)
    except Exception as e:
        logger.error(f"Error invalidating session: {str(e)}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)