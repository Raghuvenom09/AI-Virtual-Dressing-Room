"""
Hugging Face Virtual Try-On Service
Uses IDM-VTON via Gradio Client (Authenticated)
"""

import os
import logging
import numpy as np
from PIL import Image
from io import BytesIO
import base64
import tempfile
from gradio_client import Client, handle_file
from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum
from dotenv import load_dotenv

# Load environment variables (to get HF_TOKEN)
load_dotenv()

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================
# DATA STRUCTURES
# ============================================

class ClothingType(Enum):
    """Enumeration for clothing types to match tryon_api.py expectation"""
    SHIRT = "shirt"
    PANTS = "pants"
    DRESS = "dress"
    JACKET = "jacket"
    SKIRT = "skirt"
    SHOES = "shoes"
    SWEATER = "sweater"
    COAT = "coat"

@dataclass
class ClothingItem:
    # Can accept string or ClothingType enum
    item_type: any = "clothing" 
    color: str = ""
    pattern: str = ""
    size: str = ""
    fit: str = ""
    style: str = ""

@dataclass
class BodyMeasurements:
    height: float = 170
    chest: float = 0
    waist: float = 0
    hips: float = 0
    shoulder_width: float = 0
    body_shape: str = "regular"

@dataclass
class TryOnResult:
    original_image: np.ndarray
    result_image: np.ndarray
    confidence: float
    recommendations: List[str]
    fit_analysis: Dict[str, str]

# ============================================
# HUGGING FACE ENGINE
# ============================================

class VirtualTryOnEngine:
    def __init__(self):
        # We use the official IDM-VTON space
        self.hf_space = "yisol/IDM-VTON" 
        self.client = None
        logger.info(f"VirtualTryOnEngine pointing to HF Space: {self.hf_space}")

    def load_models(self):
        """Initialize Gradio Client with Authentication"""
        try:
            # Check for Hugging Face Token in .env
            hf_token = os.getenv('HF_TOKEN')
            
            if hf_token:
                logger.info("🔑 Found HF_TOKEN, using authenticated client for higher quota")
                self.client = Client(self.hf_space, hf_token=hf_token)
            else:
                logger.warning("⚠️ No HF_TOKEN found. Using anonymous mode (Low Quota/Queue delays)")
                self.client = Client(self.hf_space)
                
            logger.info("✅ Connected to Hugging Face Space")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to HF Space: {e}")
            return False

    def _save_temp_file(self, image_array: np.ndarray, prefix: str) -> str:
        """Save numpy array to a temporary file and return path"""
        try:
            # Ensure RGB format
            if len(image_array.shape) == 2:
                image_array = cv2.cvtColor(image_array, cv2.COLOR_GRAY2RGB)
            elif image_array.shape[2] == 3:
                image_array = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
            elif image_array.shape[2] == 4:
                image_array = cv2.cvtColor(image_array, cv2.COLOR_BGRA2RGB)
            
            pil_img = Image.fromarray(image_array)
            
            # Create temp file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png", prefix=prefix)
            pil_img.save(temp_file.name)
            temp_file.close()
            return temp_file.name
        except Exception as e:
            logger.error(f"Error saving temp file: {e}")
            raise

    def process_tryon(
        self,
        person_image: np.ndarray,
        clothing_image: np.ndarray,
        clothing_item: ClothingItem,
        body_measurements: Optional[BodyMeasurements] = None,
        llm_engine: Optional['LLMRecommendationEngine'] = None,
    ) -> TryOnResult:
        """
        Process try-on using IDM-VTON on Hugging Face
        """
        logger.info("🚀 Sending try-on request to Hugging Face...")
        
        if not self.client:
            if not self.load_models():
                 return TryOnResult(person_image, person_image, 0.0, ["Connection Failed"], {"fit_description": "API Error"})

        person_path = None
        cloth_path = None

        try:
            # 1. Save images to temp files
            person_path = self._save_temp_file(person_image, "person_")
            cloth_path = self._save_temp_file(clothing_image, "cloth_")
            
            logger.info(f"📂 Temp files created: {person_path}, {cloth_path}")

            # 2. Prepare Description
            # Extract string value if item_type is an Enum
            type_str = clothing_item.item_type.value if hasattr(clothing_item.item_type, 'value') else str(clothing_item.item_type)
            description = f"{clothing_item.color} {type_str}"

            # 3. Call the API
            result_path = self.client.predict(
                dict={"background": handle_file(person_path), "layers": [], "composite": None},
                garm_img=handle_file(cloth_path),
                garment_des=description,
                is_checked=True, 
                is_checked_crop=False, 
                denoise_steps=30,
                seed=42,
                api_name="/tryon"
            )
            
            # 4. Read Result (Tuple: [image_path, mask_path])
            output_image_path = result_path[0]
            logger.info(f"✅ Received result from HF: {output_image_path}")
            
            # Load result back to numpy
            result_pil = Image.open(output_image_path)
            result_image = cv2.cvtColor(np.array(result_pil), cv2.COLOR_RGB2BGR)

            # 5. Generate AI Recommendations
            recommendations = ["Generated with IDM-VTON"]
            if llm_engine:
                try:
                    recommendations = llm_engine.generate_recommendations(clothing_item, body_measurements)
                except Exception as e:
                    logger.warning(f"Failed to generate recommendations: {e}")

            # 6. Cleanup
            if os.path.exists(person_path): os.unlink(person_path)
            if os.path.exists(cloth_path): os.unlink(cloth_path)

            return TryOnResult(
                original_image=person_image,
                result_image=result_image,
                confidence=0.95,
                recommendations=recommendations,
                fit_analysis={
                    "fit_rating": 0.95,
                    "fit_description": "High-fidelity virtual try-on result",
                    "color_match": 0.98,
                    "style_match": 0.98,
                    "overall_score": 0.96,
                }
            )

        except Exception as e:
            logger.error(f"❌ Hugging Face API Error: {str(e)}")
            # Cleanup on error
            if person_path and os.path.exists(person_path): os.unlink(person_path)
            if cloth_path and os.path.exists(cloth_path): os.unlink(cloth_path)
            
            return TryOnResult(
                original_image=person_image,
                result_image=person_image,
                confidence=0.0,
                recommendations=["Try-on failed."],
                fit_analysis={"fit_description": f"Error: {str(e)}"} 
            )

# ============================================
# AI RECOMMENDATION ENGINE (Using Gemini)
# ============================================

class LLMRecommendationEngine:
    def __init__(self, use_local: bool = False):
        try:
            import google.generativeai as genai
            api_key = os.getenv('GEMINI_API_KEY')
            if api_key:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                logger.info("✅ Gemini API initialized for recommendations")
            else:
                logger.warning("⚠️ GEMINI_API_KEY not found, using fallback recommendations")
                self.model = None
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            self.model = None

    def generate_recommendations(self, clothing_item: ClothingItem, body_measurements: Optional[BodyMeasurements] = None) -> List[str]:
        """Generate AI-powered fashion recommendations"""
        if not self.model:
            return [
                f"This {clothing_item.color} {clothing_item.item_type} suits your style",
                "Consider pairing with complementary colors",
                "The fit looks great on your body type"
            ]
        
        try:
            # Build prompt
            type_str = clothing_item.item_type.value if hasattr(clothing_item.item_type, 'value') else str(clothing_item.item_type)
            
            prompt = f"""You are a professional fashion stylist. Provide 3-4 brief, personalized styling recommendations for:

Clothing: {clothing_item.color} {type_str}, {clothing_item.pattern} pattern, {clothing_item.fit} fit, {clothing_item.style} style
"""
            if body_measurements:
                prompt += f"\nBody Shape: {body_measurements.body_shape}, Height: {body_measurements.height}cm"
            
            prompt += "\n\nProvide recommendations as a list. Each should be 1 short sentence. Focus on styling tips, color pairings, and occasions."
            
            response = self.model.generate_content(prompt)
            recommendations = [line.strip('• -').strip() for line in response.text.split('\n') if line.strip()]
            return recommendations[:4] if recommendations else ["Great choice for your style!"]
            
        except Exception as e:
            logger.error(f"Gemini recommendation error: {e}")
            return ["Great choice!", "This color complements your style"]

    def get_fashion_advice(self, body_shape: str, style_preference: str, occasion: str, budget: str) -> str:
        if not self.model:
            return f"Fashion advice for {body_shape} body shape with {style_preference} style preference."
        
        try:
            prompt = f"""As a fashion expert, provide personalized fashion advice for:
- Body Shape: {body_shape}
- Style: {style_preference}
- Occasion: {occasion}
- Budget: {budget}

Give 2-3 actionable tips in a friendly tone."""
            
            response = self.model.generate_content(prompt)
            return response.text
        except:
            return "Fashion advice temporarily unavailable."

    def analyze_outfit_compatibility(self, items) -> Dict:
        if not self.model:
            return {"analysis": "Compatibility check unavailable", "items_count": len(items)}
        
        try:
            prompt = f"Analyze outfit compatibility for these items: {items}. Rate compatibility 1-10 and explain briefly."
            response = self.model.generate_content(prompt)
            return {"analysis": response.text, "items_count": len(items)}
        except:
            return {"analysis": "Analysis unavailable", "items_count": len(items)}

# Helper functions (Required by tryon_api.py)
def image_to_base64(image: np.ndarray) -> str:
    try:
        _, buffer = cv2.imencode(".jpg", image)
        return base64.b64encode(buffer).decode("utf-8")
    except Exception: return ""

def base64_to_image(base64_str: str) -> np.ndarray:
    try:
        image_data = base64.b64decode(base64_str)
        image = Image.open(BytesIO(image_data))
        return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    except Exception: return np.zeros((512, 512, 3), dtype=np.uint8)