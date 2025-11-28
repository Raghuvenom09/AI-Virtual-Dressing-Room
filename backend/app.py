"""
Virtual Dressing Room - AI Backend Service (Gemini Version)
Integrates Google Gemini 1.5 Flash for Virtual Try-On
"""

import os
import logging
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import try-on API
# This will now use the updated llm_tryon_service we created in Phase 1
from tryon_api import tryon_bp

# ============================================
# CONFIGURATION
# ============================================

app = Flask(__name__)
CORS(app)

# Register try-on API blueprint
app.register_blueprint(tryon_bp)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# ============================================
# ROUTES
# ============================================

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Virtual Dressing Room (Gemini Powered)',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/')
def index():
    return jsonify({
        "message": "Virtual Dressing Room Backend is Running",
        "api_endpoint": "/api/tryon/process"
    })

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'File too large. Maximum size is 50MB'}), 413

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5000))
    logger.info(f"Starting Gemini-Powered Backend on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)