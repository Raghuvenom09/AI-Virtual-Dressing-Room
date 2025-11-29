"""
Railway-safe Virtual Try-On Service
Uses Hugging Face Inference API (no cv2, no gradio_client)
"""

import os
import logging
import numpy as np
from PIL import Image
from io import BytesIO
import base64
import tempfile
import requests
from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =====================================================
# DATA STRUCTURES
# =====================================================

class ClothingType(Enum):
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

# =====================================================
# VIRTUAL TRY-ON ENGINE (HuggingFace API)
# =====================================================

class VirtualTryOnEngine:
    def __init__(self):
        self.hf_space = "yisol/IDM-VTON"
        # Updated to use new HuggingFace router endpoint (old api-inference.huggingface.co is deprecated)
        self.api_url = f"https://router.huggingface.co/models/{self.hf_space}"
        self.hf_token = os.getenv("HF_TOKEN")
        logger.info(f"VirtualTryOnEngine using HF Inference API: {self.hf_space}")

    def process_tryon(
        self,
        person_image: np.ndarray,
        clothing_image: np.ndarray,
        clothing_item: ClothingItem,
        body_measurements: Optional[BodyMeasurements] = None,
        llm_engine: Optional['LLMRecommendationEngine'] = None,
    ) -> TryOnResult:

        logger.info("🚀 Sending try-on request to HuggingFace API...")

        headers = {"Content-Type": "application/json"}
        if self.hf_token:
            headers["Authorization"] = f"Bearer {self.hf_token}"

        try:
            # Convert to base64
            person_b64 = self._img_to_b64(person_image)
            cloth_b64 = self._img_to_b64(clothing_image)

            payload = {
                "inputs": {
                    "person_image": person_b64,
                    "clothing_image": cloth_b64,
                    "description": f"{clothing_item.color} {clothing_item.item_type}"
                }
            }

            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=60
            )

            logger.info(f"HF API Status: {response.status_code}")

            if response.status_code != 200:
                raise Exception(response.text)

            data = response.json()

            # Returned base64 image
            output_b64 = data.get("generated_image")
            result_img = self._b64_to_img(output_b64)

            # Recommendations
            recs = ["Try-on generated successfully."]
            if llm_engine:
                recs = llm_engine.generate_recommendations(clothing_item, body_measurements)

            return TryOnResult(
                original_image=person_image,
                result_image=result_img,
                confidence=0.95,
                recommendations=recs,
                fit_analysis={"fit_description": "Virtual try-on successful"}
            )

        except Exception as e:
            logger.error(f"❌ Try-on error: {e}")
            return TryOnResult(
                original_image=person_image,
                result_image=person_image,
                confidence=0.0,
                recommendations=["Try-on failed."],
                fit_analysis={"fit_description": str(e)}
            )

    # image → base64
    def _img_to_b64(self, img):
        pil = Image.fromarray(img)
        buf = BytesIO()
        pil.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode()

    # base64 → image (numpy)
    def _b64_to_img(self, b64_data):
        raw = base64.b64decode(b64_data)
        pil = Image.open(BytesIO(raw))
        return np.array(pil)


# =====================================================
# GEMINI RECOMMENDATION ENGINE
# =====================================================

class LLMRecommendationEngine:
    def __init__(self):
        try:
            import google.generativeai as genai
            key = os.getenv("GEMINI_API_KEY")

            if key:
                genai.configure(api_key=key)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                logger.info("Gemini initialized.")
            else:
                logger.warning("No GEMINI_API_KEY. Using fallback.")
                self.model = None
        except:
            logger.error("Failed to load Gemini.")
            self.model = None

    def generate_recommendations(self, clothing_item, body_measurements=None):
        if not self.model:
            return [
                f"This {clothing_item.color} {clothing_item.item_type} suits you.",
                "Consider pairing with complementary colors.",
                "The fit looks clean and balanced."
            ]

        try:
            prompt = f"""
Provide 3 short styling recommendations for:
Color: {clothing_item.color}
Item: {clothing_item.item_type}
Pattern: {clothing_item.pattern}
"""

            response = self.model.generate_content(prompt)
            text = response.text
            lines = [l.strip("-• ").strip() for l in text.split("\n") if l.strip()]
            return lines[:3]

        except:
            return ["Nice choice!", "This item fits your style."]


# =====================================================
# IMAGE HELPERS (required by tryon_api)
# =====================================================

def image_to_base64(image: np.ndarray) -> str:
    pil = Image.fromarray(image)
    buf = BytesIO()
    pil.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()

def base64_to_image(base64_str: str) -> np.ndarray:
    raw = base64.b64decode(base64_str)
    pil = Image.open(BytesIO(raw))
    return np.array(pil)
