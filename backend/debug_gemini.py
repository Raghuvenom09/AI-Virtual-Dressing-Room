import os
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image
from io import BytesIO
import requests

# Load environment variables
load_dotenv()

# Configure Gemini
api_key = os.getenv('GEMINI_API_KEY')
print(f"🔑 API Key found: {'Yes' if api_key else 'NO'}")

if not api_key:
    print("❌ ERROR: Missing GEMINI_API_KEY in .env file")
    exit()

genai.configure(api_key=api_key)

def test_simple_generation():
    print("\n--- TEST 1: Simple Text Generation ---")
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello, are you working?")
        print(f"✅ Response: {response.text}")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False

def test_image_capability():
    print("\n--- TEST 2: Image Generation/Editing Capability ---")
    try:
        # Load placeholder images from web to test
        print("📥 Downloading test images...")
        person_url = "https://storage.googleapis.com/generativeai-downloads/images/scones.jpg" # Dummy image
        person_img = Image.open(requests.get(person_url, stream=True).raw)
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = "Describe this image."
        print(f"📤 Sending prompt: '{prompt}'")
        
        response = model.generate_content([prompt, person_img])
        
        if response.text:
            print(f"✅ Analysis Success: {response.text[:100]}...")
        else:
            print("❌ Model returned no text.")
            
    except Exception as e:
        print(f"❌ Failed: {e}")

def test_safety_refusal():
    print("\n--- TEST 3: Checking Safety Filters (The Try-On Prompt) ---")
    try:
        # Fix: Check current directory AND backend directory
        person_path = None
        if os.path.exists('person.jpg'):
            person_path = 'person.jpg'
            cloth_path = 'clothing.jpg'
        elif os.path.exists('backend/person.jpg'):
            person_path = 'backend/person.jpg'
            cloth_path = 'backend/clothing.jpg'
            
        if not person_path:
            print("⚠️ Local images not found. Please ensure 'person.jpg' and 'clothing.jpg' are in the backend folder.")
            print(f"   Current working directory: {os.getcwd()}")
            return

        person_img = Image.open(person_path)
        cloth_img = Image.open(cloth_path)
        print(f"✅ Loaded images from {person_path}")

        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # This is the prompt causing issues
        prompt = "Generate a new image of this person wearing this clothing. Replace the current clothes."
        
        print("📤 Sending Try-On Prompt...")
        response = model.generate_content([prompt, person_img, cloth_img])
        
        print("\n🔍 RAW RESPONSE DEBUG INFO:")
        try:
            print(f"Finish Reason: {response.candidates[0].finish_reason}")
            print(f"Safety Ratings: {response.candidates[0].safety_ratings}")
        except:
            print("Could not access candidate info (Response might be empty)")
        
        try:
            if response.parts[0].image:
                 print("✅ IMAGE GENERATED SUCCESSFULLY!")
        except:
            print(f"❌ NO IMAGE RETURNED.")
            try:
                if response.text:
                    print(f"⚠️ Model Text Response: {response.text}")
            except:
                print("⚠️ No text returned either.")
                print(f"Feedback: {response.prompt_feedback}")
                
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_simple_generation()
    test_image_capability()
    test_safety_refusal()