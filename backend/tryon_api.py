"""
Virtual Try-On API Routes (Raw Base64 Version)
Fixes double-prefix issue by sending raw base64 strings.
"""

import logging
from flask import Blueprint, request, jsonify
import numpy as np
import cv2
import base64
from io import BytesIO
from PIL import Image

# Import from our new service
from llm_tryon_service import (
    VirtualTryOnEngine,
    LLMRecommendationEngine,
    ClothingItem,
    ClothingType,
    BodyMeasurements,
    image_to_base64,
    base64_to_image,
)

logger = logging.getLogger(__name__)
tryon_bp = Blueprint("tryon", __name__, url_prefix="/api/tryon")

# Initialize engines
tryon_engine = VirtualTryOnEngine()
llm_engine = LLMRecommendationEngine()

# ============================================
# UTILITY: VALIDATION & FORMATTING
# ============================================

def format_image_response(img_array):
    """
    Convert numpy array to Raw Base64 string.
    Does NOT add 'data:image/jpeg;base64,' prefix.
    """
    if img_array is None:
        return None
        
    # Just return the raw string so frontend can handle the prefix
    return image_to_base64(img_array)

def validate_image(image_data):
    """Validate and decode image data from frontend"""
    try:
        if not image_data:
            return None, "No image data"
            
        # Handle Data URI prefix (remove it if present)
        if isinstance(image_data, str) and "base64," in image_data:
            image_data = image_data.split("base64,")[1]

        if isinstance(image_data, str):
            image_array = base64_to_image(image_data)
        else:
            # Direct file upload
            image_array = np.array(Image.open(image_data))
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)

        return image_array, None
    except Exception as e:
        return None, str(e)

def parse_clothing_item(data):
    """Parse clothing item data safely"""
    try:
        # Handle string or enum for item_type
        type_val = data.get("item_type", "shirt")
        # If it comes as "ClothingType.SHIRT", assume we just want the string "shirt"
        if hasattr(type_val, 'value'): 
            type_val = type_val.value
            
        # Map string to Enum if possible, otherwise default
        try:
            c_type = ClothingType(type_val.lower())
        except:
            c_type = ClothingType.SHIRT

        return ClothingItem(
            item_type=c_type,
            color=data.get("color", "black"),
            pattern=data.get("pattern", "solid"),
            size=data.get("size", "M"),
            fit=data.get("fit", "regular"),
            style=data.get("style", "casual"),
        )
    except Exception as e:
        logger.error(f"Error parsing clothing item: {e}")
        return ClothingItem(item_type=ClothingType.SHIRT)

# ============================================
# API ENDPOINTS
# ============================================

@tryon_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "HuggingFace VTON"}), 200

@tryon_bp.route("/process", methods=["POST"])
def process_virtual_tryon():
    try:
        data = request.get_json()
        
        # 1. Validate Inputs
        if not data or "person_image" not in data or "clothing_image" not in data:
            return jsonify({"status": "error", "message": "Missing images"}), 400

        # 2. Decode Images
        person_img, p_err = validate_image(data["person_image"])
        clothing_img, c_err = validate_image(data["clothing_image"])
        
        if p_err or c_err:
            return jsonify({"status": "error", "message": f"Image Error: {p_err or c_err}"}), 400

        # 3. Parse Details
        clothing_item = parse_clothing_item(data.get("clothing_item", {}))
        
        # 4. Parse body measurements (optional)
        body_measurements = None
        if "body_measurements" in data:
            try:
                bm = data["body_measurements"]
                body_measurements = BodyMeasurements(
                    height=float(bm.get("height", 170)),
                    chest=float(bm.get("chest", 0)),
                    waist=float(bm.get("waist", 0)),
                    hips=float(bm.get("hips", 0)),
                    shoulder_width=float(bm.get("shoulder_width", 0)),
                    body_shape=bm.get("body_shape", "regular")
                )
            except Exception as e:
                logger.warning(f"Failed to parse body measurements: {e}")
        
        # 5. Get user_id for storage tracking (optional)
        user_id = data.get("user_id", None)
        
        # 6. Process via HuggingFace with AI recommendations
        result = tryon_engine.process_tryon(
            person_img,
            clothing_img,
            clothing_item,
            body_measurements,
            llm_engine  # Pass the LLM engine for recommendations
        )

        # 7. Return Response
        return jsonify({
            "status": "success",
            "result_image": format_image_response(result.result_image),
            "confidence": result.confidence,
            "fit_analysis": result.fit_analysis,
            "recommendations": result.recommendations,
            "user_id": user_id  # Echo back for frontend tracking
        }), 200

    except Exception as e:
        logger.error(f"API Error: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@tryon_bp.route("/recommendations", methods=["POST"])
def get_recommendations():
    # Mock endpoint to prevent 404s in frontend
    return jsonify({
        "status": "success",
        "recommendations": ["Great choice!", "Matches your style."]
    }), 200