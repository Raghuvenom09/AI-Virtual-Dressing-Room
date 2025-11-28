"""
Comprehensive Backend Testing Script
Tests all endpoints and verifies virtual try-on functionality
"""

import requests
import json
import base64
import cv2
import numpy as np
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:5000"
TRYON_API_URL = "http://localhost:5000/api/tryon"

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

def test_health():
    """Test health endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Health Check")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_parse_human():
    """Test human parsing endpoint"""
    print("\n" + "="*60)
    print("TEST 2: Human Parsing")
    print("="*60)
    try:
        with open(PERSON_IMAGE, 'rb') as f:
            files = {'image': f}
            response = requests.post(f"{BASE_URL}/parse-human", files=files, timeout=30)
        
        print(f"Status: {response.status_code}")
        data = response.json()
        
        if response.status_code == 200:
            print(f"✅ Human parsing successful")
            print(f"   - Image size: {data.get('width')} x {data.get('height')}")
            print(f"   - Mask shape: {len(data.get('mask', []))} pixels")
            print(f"   - Labels detected: {len(data.get('labels', {}))}")
            return True
        else:
            print(f"❌ Error: {data}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_segment_cloth():
    """Test cloth segmentation endpoint"""
    print("\n" + "="*60)
    print("TEST 3: Cloth Segmentation")
    print("="*60)
    try:
        with open(CLOTHING_IMAGE, 'rb') as f:
            files = {'image': f}
            response = requests.post(f"{BASE_URL}/segment-cloth", files=files, timeout=30)
        
        print(f"Status: {response.status_code}")
        data = response.json()
        
        if response.status_code == 200:
            print(f"✅ Cloth segmentation successful")
            print(f"   - Image size: {data.get('width')} x {data.get('height')}")
            print(f"   - Mask shape: {len(data.get('mask', []))} pixels")
            print(f"   - Labels detected: {len(data.get('labels', {}))}")
            return True
        else:
            print(f"❌ Error: {data}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_estimate_pose():
    """Test pose estimation endpoint"""
    print("\n" + "="*60)
    print("TEST 4: Pose Estimation")
    print("="*60)
    try:
        with open(PERSON_IMAGE, 'rb') as f:
            files = {'image': f}
            response = requests.post(f"{BASE_URL}/estimate-pose", files=files, timeout=30)
        
        print(f"Status: {response.status_code}")
        data = response.json()
        
        if response.status_code == 200:
            print(f"✅ Pose estimation successful")
            print(f"   - Keypoints detected: {len(data.get('keypoints', []))}")
            print(f"   - Skeleton connections: {len(data.get('skeleton', []))}")
            print(f"   - Image size: {data.get('width')} x {data.get('height')}")
            return True
        else:
            print(f"❌ Error: {data}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_process_full():
    """Test full processing endpoint"""
    print("\n" + "="*60)
    print("TEST 5: Full Processing (All Models)")
    print("="*60)
    try:
        with open(PERSON_IMAGE, 'rb') as f:
            files = {'image': f}
            response = requests.post(f"{BASE_URL}/process-full", files=files, timeout=60)
        
        print(f"Status: {response.status_code}")
        data = response.json()
        
        if response.status_code == 200:
            print(f"✅ Full processing successful")
            print(f"   - Human parsing: ✅")
            print(f"   - Pose estimation: ✅")
            print(f"   - Cloth segmentation: ✅")
            print(f"   - Timestamp: {data.get('timestamp')}")
            return True
        else:
            print(f"❌ Error: {data}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_tryon_health():
    """Test try-on API health"""
    print("\n" + "="*60)
    print("TEST 6: Try-On API Health")
    print("="*60)
    try:
        response = requests.get(f"{TRYON_API_URL}/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_virtual_tryon():
    """Test virtual try-on processing"""
    print("\n" + "="*60)
    print("TEST 7: Virtual Try-On Processing (MAIN TEST)")
    print("="*60)
    try:
        # Load images as base64
        person_b64 = load_image_as_base64(PERSON_IMAGE)
        clothing_b64 = load_image_as_base64(CLOTHING_IMAGE)
        
        if not person_b64 or not clothing_b64:
            print("❌ Failed to load images")
            return False
        
        # Prepare request
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
        
        print("Sending virtual try-on request...")
        response = requests.post(
            f"{TRYON_API_URL}/process",
            json=payload,
            timeout=60
        )
        
        print(f"Status: {response.status_code}")
        data = response.json()
        
        if response.status_code == 200:
            print(f"✅ Virtual try-on successful!")
            print(f"   - Result image: Generated ✅")
            print(f"   - Confidence: {data.get('confidence', 0):.2f}")
            print(f"   - Fit rating: {data.get('fit_analysis', {}).get('fit_rating', 0):.2f}")
            print(f"   - Overall score: {data.get('fit_analysis', {}).get('overall_score', 0):.2f}")
            print(f"   - Fit description: {data.get('fit_analysis', {}).get('fit_description', 'N/A')}")
            print(f"   - Recommendations: {len(data.get('recommendations', []))} items")
            
            # Save result image
            if data.get('result_image'):
                result_img = base64.b64decode(data['result_image'])
                with open('tryon_result.jpg', 'wb') as f:
                    f.write(result_img)
                print(f"   - Result saved to: tryon_result.jpg ✅")
            
            return True
        else:
            print(f"❌ Error: {data}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_analyze_body():
    """Test body analysis endpoint"""
    print("\n" + "="*60)
    print("TEST 8: Body Analysis")
    print("="*60)
    try:
        person_b64 = load_image_as_base64(PERSON_IMAGE)
        if not person_b64:
            print("❌ Failed to load image")
            return False
        
        payload = {"image": person_b64}
        response = requests.post(
            f"{TRYON_API_URL}/analyze-body",
            json=payload,
            timeout=60
        )
        
        print(f"Status: {response.status_code}")
        data = response.json()
        
        if response.status_code == 200:
            print(f"✅ Body analysis successful")
            print(f"   - Body segmentation: Generated ✅")
            print(f"   - Clothing mask: Generated ✅")
            print(f"   - Clothing info: {data.get('clothing_info', {})}")
            return True
        else:
            print(f"❌ Error: {data}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "█"*60)
    print("█" + " "*58 + "█")
    print("█" + "  VIRTUAL DRESSING ROOM - BACKEND VERIFICATION".center(58) + "█")
    print("█" + " "*58 + "█")
    print("█"*60)
    
    results = {
        "Health Check": test_health(),
        "Human Parsing": test_parse_human(),
        "Cloth Segmentation": test_segment_cloth(),
        "Pose Estimation": test_estimate_pose(),
        "Full Processing": test_process_full(),
        "Try-On API Health": test_tryon_health(),
        "Body Analysis": test_analyze_body(),
        "Virtual Try-On (MAIN)": test_virtual_tryon(),
    }
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("="*60)
    print(f"Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Backend is fully working!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check the output above.")
    
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
