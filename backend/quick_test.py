"""
Quick test of the fixed virtual try-on
"""

import requests
import base64
import json

BASE_URL = "http://localhost:5000/api/tryon"

def load_image_as_base64(image_path):
    """Load image and convert to base64"""
    with open(image_path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

print("\n" + "="*60)
print("TESTING FIXED VIRTUAL TRY-ON")
print("="*60)

try:
    person_b64 = load_image_as_base64('person.jpg')
    clothing_b64 = load_image_as_base64('clothing.jpg')
    
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
    
    print("\n📤 Sending request to backend...")
    response = requests.post(
        f"{BASE_URL}/process",
        json=payload,
        timeout=120
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        print("\n✅ SUCCESS! Virtual try-on processed!")
        print(f"\nResults:")
        print(f"  - Confidence: {data.get('confidence', 0):.2f}")
        print(f"  - Fit Rating: {data.get('fit_analysis', {}).get('fit_rating', 0):.2f}")
        print(f"  - Color Match: {data.get('fit_analysis', {}).get('color_match', 0):.2f}")
        print(f"  - Style Match: {data.get('fit_analysis', {}).get('style_match', 0):.2f}")
        print(f"  - Overall Score: {data.get('fit_analysis', {}).get('overall_score', 0):.2f}")
        print(f"  - Fit Description: {data.get('fit_analysis', {}).get('fit_description', 'N/A')}")
        print(f"\nRecommendations:")
        for i, rec in enumerate(data.get('recommendations', []), 1):
            print(f"  {i}. {rec}")
        
        # Save result
        if data.get('result_image'):
            result_img = base64.b64decode(data['result_image'])
            with open('tryon_result_fixed.jpg', 'wb') as f:
                f.write(result_img)
            print(f"\n✅ Result image saved to: tryon_result_fixed.jpg")
    else:
        print(f"\n❌ Error: {response.json()}")

except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*60 + "\n")
