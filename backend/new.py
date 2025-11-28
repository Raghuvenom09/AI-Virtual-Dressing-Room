import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

print("🔍 Checking for Image Generation Models...")
try:
    models = list(genai.list_models())
    imagen_models = [m.name for m in models if 'imagen' in m.name or 'generate_images' in m.supported_generation_methods]
    
    if imagen_models:
        print(f"✅ Found Image Generation Models: {imagen_models}")
    else:
        print("❌ No Imagen models found. Your API Key might be limited to Text/Gemini only.")
        print("   Available models:", [m.name for m in models])
except Exception as e:
    print(f"❌ Error: {e}")