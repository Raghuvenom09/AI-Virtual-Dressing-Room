"""
Diagnostic script to identify backend issues
"""

import sys
import os
import torch
import cv2
import numpy as np
from PIL import Image
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

print("\n" + "="*60)
print("BACKEND DIAGNOSTIC REPORT")
print("="*60)

# 1. Check Python version
print(f"\n1. Python Version: {sys.version}")

# 2. Check PyTorch
print(f"\n2. PyTorch Installation:")
print(f"   - Version: {torch.__version__}")
print(f"   - CUDA Available: {torch.cuda.is_available()}")
print(f"   - Device: {'GPU' if torch.cuda.is_available() else 'CPU'}")

# 3. Check image files
print(f"\n3. Test Images:")
for img_file in ['person.jpg', 'clothing.jpg']:
    if os.path.exists(img_file):
        img = Image.open(img_file)
        print(f"   ✅ {img_file}: {img.size} {img.mode}")
    else:
        print(f"   ❌ {img_file}: NOT FOUND")

# 4. Test model loading
print(f"\n4. Model Loading Test:")

try:
    from transformers import AutoImageProcessor, SegformerForSemanticSegmentation
    
    print("   Loading human parser model...")
    processor = AutoImageProcessor.from_pretrained("mattmdjaga/segformer_b2_clothes")
    model = SegformerForSemanticSegmentation.from_pretrained("mattmdjaga/segformer_b2_clothes")
    print("   ✅ Model loaded successfully")
    
    # Test inference
    print("   Testing inference...")
    img = Image.open('person.jpg').convert('RGB')
    inputs = processor(images=img, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    print("   ✅ Inference successful")
    
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()

# 5. Test image processing
print(f"\n5. Image Processing Test:")

try:
    img = cv2.imread('person.jpg')
    print(f"   - Image shape: {img.shape}")
    print(f"   - Image dtype: {img.dtype}")
    print("   ✅ Image processing OK")
except Exception as e:
    print(f"   ❌ Error: {e}")

# 6. Check Flask
print(f"\n6. Flask Installation:")
try:
    import flask
    print(f"   ✅ Flask {flask.__version__} installed")
except Exception as e:
    print(f"   ❌ Error: {e}")

# 7. Check required dependencies
print(f"\n7. Required Dependencies:")
dependencies = [
    'torch', 'torchvision', 'transformers', 'opencv-python',
    'numpy', 'Pillow', 'Flask', 'Flask-CORS', 'scikit-image', 'scipy'
]

for dep in dependencies:
    try:
        __import__(dep.replace('-', '_'))
        print(f"   ✅ {dep}")
    except ImportError:
        print(f"   ❌ {dep} - NOT INSTALLED")

print("\n" + "="*60)
print("END OF DIAGNOSTIC REPORT")
print("="*60 + "\n")
