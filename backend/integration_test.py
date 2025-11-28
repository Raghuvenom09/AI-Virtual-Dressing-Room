"""
Comprehensive Backend-Frontend Integration Test
Tests all functionality and identifies issues
"""

import requests
import base64
import json
import time
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:3000"
TRYON_API = f"{BACKEND_URL}/api/tryon"

# Test images
PERSON_IMAGE = "person.jpg"
CLOTHING_IMAGE = "clothing.jpg"

def load_image_as_base64(image_path):
    """Load image and convert to base64"""
    if not Path(image_path).exists():
        print(f"❌ Image not found: {image_path}")
        return None
    with open(image_path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

def print_header(title):
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def test_backend_health():
    """Test backend health"""
    print_header("TEST 1: Backend Health Check")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is running")
            print(f"   Device: {data.get('device')}")
            print(f"   Status: {data.get('status')}")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return False

def test_tryon_api_health():
    """Test try-on API health"""
    print_header("TEST 2: Try-On API Health Check")
    try:
        response = requests.get(f"{TRYON_API}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Try-On API is running")
            print(f"   Service: {data.get('service')}")
            print(f"   Version: {data.get('version')}")
            return True
        else:
            print(f"❌ API returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API not accessible: {e}")
        return False

def test_frontend_health():
    """Test frontend health"""
    print_header("TEST 3: Frontend Health Check")
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print(f"✅ Frontend is running on {FRONTEND_URL}")
            return True
        else:
            print(f"❌ Frontend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend not accessible: {e}")
        return False

def test_virtual_tryon_basic():
    """Test basic virtual try-on"""
    print_header("TEST 4: Virtual Try-On (Basic)")
    try:
        person_b64 = load_image_as_base64(PERSON_IMAGE)
        clothing_b64 = load_image_as_base64(CLOTHING_IMAGE)
        
        if not person_b64 or not clothing_b64:
            print("❌ Failed to load images")
            return False
        
        payload = {
            "person_image": person_b64,
            "clothing_image": clothing_b64,
            "clothing_item": {
                "item_type": "shirt",
                "color": "blue",
                "pattern": "solid",
                "size": "M",
                "fit": "regular",
                "style": "casual"
            },
            "body_measurements": {
                "height": 170,
                "chest": 95,
                "waist": 80,
                "hips": 100,
                "shoulder_width": 40,
                "body_shape": "rectangle"
            }
        }
        
        print("Sending try-on request...")
        response = requests.post(
            f"{TRYON_API}/process",
            json=payload,
            timeout=120
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Try-on processed successfully")
            print(f"   Status: {data.get('status')}")
            print(f"   Confidence: {data.get('confidence', 0):.2f}")
            print(f"   Result Image: {'Generated' if data.get('result_image') else 'Missing'}")
            print(f"   Fit Analysis: {len(data.get('fit_analysis', {}))} fields")
            print(f"   Recommendations: {len(data.get('recommendations', []))} items")
            
            # Show fit analysis details
            fit = data.get('fit_analysis', {})
            print(f"\n   Fit Analysis Details:")
            print(f"     - Fit Rating: {fit.get('fit_rating', 0):.2f}")
            print(f"     - Color Match: {fit.get('color_match', 0):.2f}")
            print(f"     - Style Match: {fit.get('style_match', 0):.2f}")
            print(f"     - Overall Score: {fit.get('overall_score', 0):.2f}")
            print(f"     - Description: {fit.get('fit_description', 'N/A')}")
            
            # Save result
            if data.get('result_image'):
                result_img = base64.b64decode(data['result_image'])
                with open('integration_test_result.jpg', 'wb') as f:
                    f.write(result_img)
                print(f"\n   ✅ Result saved to: integration_test_result.jpg")
            
            return True
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"   Response: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_body_analysis():
    """Test body analysis"""
    print_header("TEST 5: Body Analysis")
    try:
        person_b64 = load_image_as_base64(PERSON_IMAGE)
        if not person_b64:
            print("❌ Failed to load image")
            return False
        
        payload = {"image": person_b64}
        
        print("Analyzing body...")
        response = requests.post(
            f"{TRYON_API}/analyze-body",
            json=payload,
            timeout=120
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Body analysis completed")
            print(f"   Status: {data.get('status')}")
            print(f"   Body Segmentation: {'Generated' if data.get('body_segmentation') else 'Missing'}")
            print(f"   Clothing Mask: {'Generated' if data.get('clothing_mask') else 'Missing'}")
            print(f"   Clothing Info: {data.get('clothing_info', {})}")
            return True
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"   Response: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_recommendations():
    """Test recommendations"""
    print_header("TEST 6: Clothing Recommendations")
    try:
        person_b64 = load_image_as_base64(PERSON_IMAGE)
        if not person_b64:
            print("❌ Failed to load image")
            return False
        
        payload = {
            "person_image": person_b64,
            "body_measurements": {
                "height": 170,
                "chest": 95,
                "waist": 80,
                "hips": 100,
                "shoulder_width": 40,
                "body_shape": "rectangle"
            },
            "style_preference": "casual"
        }
        
        print("Getting recommendations...")
        response = requests.post(
            f"{TRYON_API}/recommendations",
            json=payload,
            timeout=120
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Recommendations generated")
            print(f"   Status: {data.get('status')}")
            recs = data.get('recommendations', [])
            print(f"   Total Recommendations: {len(recs)}")
            for i, rec in enumerate(recs[:5], 1):
                print(f"     {i}. {rec}")
            return True
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"   Response: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_fashion_advice():
    """Test fashion advice"""
    print_header("TEST 7: Fashion Advice (LLM)")
    try:
        payload = {
            "body_shape": "rectangle",
            "style_preference": "casual",
            "occasion": "daily",
            "budget": "medium"
        }
        
        print("Getting fashion advice...")
        response = requests.post(
            f"{TRYON_API}/fashion-advice",
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Fashion advice generated")
            print(f"   Status: {data.get('status')}")
            advice = data.get('advice', '')
            if advice:
                print(f"   Advice Preview: {advice[:200]}...")
            else:
                print(f"   ⚠️  No advice returned (LLM may not be configured)")
            return True
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"   Response: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all integration tests"""
    print("\n" + "█"*70)
    print("█" + " "*68 + "█")
    print("█" + "  BACKEND-FRONTEND INTEGRATION TEST SUITE".center(68) + "█")
    print("█" + " "*68 + "█")
    print("█"*70)
    
    results = {
        "Backend Health": test_backend_health(),
        "Try-On API Health": test_tryon_api_health(),
        "Frontend Health": test_frontend_health(),
        "Virtual Try-On": test_virtual_tryon_basic(),
        "Body Analysis": test_body_analysis(),
        "Recommendations": test_recommendations(),
        "Fashion Advice": test_fashion_advice(),
    }
    
    # Summary
    print_header("INTEGRATION TEST SUMMARY")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("\n" + "="*70)
    print(f"Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL INTEGRATION TESTS PASSED!")
        print("Your backend and frontend are fully integrated and working!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed.")
        print("Check the output above for details.")
    
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
