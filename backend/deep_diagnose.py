import sys
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load env vars
load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')

print("-" * 60)
print("🔍 DEEP DIAGNOSTIC REPORT")
print("-" * 60)

# 1. Check Python Environment
print(f"1. Python Executable:\n   {sys.executable}")

# 2. Check Library Version
try:
    import google.generativeai
    print(f"\n2. Google AI Library Version:\n   {google.generativeai.__version__}")
except Exception as e:
    print(f"\n2. Google AI Library Version:\n   ❌ Error getting version: {e}")

# 3. Check API Connection & Available Models
print("\n3. Checking Available Models (API)...")
if not api_key:
    print("   ❌ NO API KEY FOUND in .env")
else:
    try:
        genai.configure(api_key=api_key)
        models = list(genai.list_models())
        
        print(f"   ✅ Connection Successful! Found {len(models)} models.")
        print("   --------------------------------------------------")
        
        flash_found = False
        for m in models:
            # Print model names to see exactly what Google calls them
            if 'gemini' in m.name:
                print(f"   - {m.name}")
                if 'flash' in m.name:
                    flash_found = True
        
        print("   --------------------------------------------------")
        if flash_found:
            print("   ✅ 'Flash' model is available in the list.")
        else:
            print("   ⚠️ 'Flash' model NOT found in the list. You may need to use 'gemini-pro'.")

    except Exception as e:
        print(f"   ❌ API Connection Failed: {e}")

print("-" * 60)