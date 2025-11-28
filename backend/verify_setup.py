#!/usr/bin/env python3
"""
Setup Verification Script
Checks if all dependencies and models are properly installed
"""

import sys
import importlib
from pathlib import Path

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    """Print section header"""
    print(f"\n{BLUE}{'='*60}")
    print(f"{text}")
    print(f"{'='*60}{RESET}\n")

def check_module(module_name, display_name=None):
    """Check if a module is installed"""
    if display_name is None:
        display_name = module_name
    
    try:
        importlib.import_module(module_name)
        print(f"{GREEN}✓{RESET} {display_name}")
        return True
    except ImportError:
        print(f"{RED}✗{RESET} {display_name} - NOT INSTALLED")
        return False

def check_file(file_path, description):
    """Check if a file exists"""
    if Path(file_path).exists():
        print(f"{GREEN}✓{RESET} {description}")
        return True
    else:
        print(f"{RED}✗{RESET} {description} - NOT FOUND")
        return False

def check_pytorch():
    """Check PyTorch and CUDA availability"""
    try:
        import torch
        cuda_available = torch.cuda.is_available()
        device = "CUDA" if cuda_available else "CPU"
        print(f"{GREEN}✓{RESET} PyTorch {torch.__version__} (Device: {device})")
        return True
    except ImportError:
        print(f"{RED}✗{RESET} PyTorch - NOT INSTALLED")
        return False

def check_transformers():
    """Check Transformers library"""
    try:
        import transformers
        print(f"{GREEN}✓{RESET} Transformers {transformers.__version__}")
        return True
    except ImportError:
        print(f"{RED}✗{RESET} Transformers - NOT INSTALLED")
        return False

def check_flask():
    """Check Flask"""
    try:
        import flask
        print(f"{GREEN}✓{RESET} Flask {flask.__version__}")
        return True
    except ImportError:
        print(f"{RED}✗{RESET} Flask - NOT INSTALLED")
        return False

def main():
    """Run all checks"""
    print(f"\n{BLUE}Virtual Dressing Room - Setup Verification{RESET}")
    
    results = {
        "Python Packages": [],
        "Project Files": [],
        "Models": [],
        "Optional Services": []
    }
    
    # Check Python version
    print_header("Python Environment")
    print(f"Python Version: {sys.version}")
    print(f"Python Executable: {sys.executable}")
    
    # Check core packages
    print_header("Core Dependencies")
    results["Python Packages"].append(check_pytorch())
    results["Python Packages"].append(check_transformers())
    results["Python Packages"].append(check_flask())
    results["Python Packages"].append(check_module("torch", "PyTorch"))
    results["Python Packages"].append(check_module("cv2", "OpenCV"))
    results["Python Packages"].append(check_module("numpy", "NumPy"))
    results["Python Packages"].append(check_module("PIL", "Pillow"))
    results["Python Packages"].append(check_module("flask_cors", "Flask-CORS"))
    
    # Check additional packages
    print_header("Additional Packages")
    results["Python Packages"].append(check_module("scipy", "SciPy"))
    results["Python Packages"].append(check_module("skimage", "Scikit-Image"))
    results["Python Packages"].append(check_module("dotenv", "Python-dotenv"))
    
    # Check project files
    print_header("Project Files")
    results["Project Files"].append(check_file("backend/app.py", "Main Flask app (app.py)"))
    results["Project Files"].append(check_file("backend/llm_tryon_service.py", "Try-on service (llm_tryon_service.py)"))
    results["Project Files"].append(check_file("backend/tryon_api.py", "Try-on API (tryon_api.py)"))
    results["Project Files"].append(check_file("backend/requirements.txt", "Requirements file (requirements.txt)"))
    results["Project Files"].append(check_file("backend/uploads", "Uploads directory (uploads/)"))
    
    # Check optional services
    print_header("Optional Services")
    results["Optional Services"].append(check_module("openai", "OpenAI API"))
    results["Optional Services"].append(check_module("ollama", "Ollama (Local LLM)"))
    
    # Summary
    print_header("Summary")
    
    total_checks = sum(len(v) for v in results.values())
    passed_checks = sum(sum(v) for v in results.values())
    
    for category, checks in results.items():
        if checks:
            passed = sum(checks)
            total = len(checks)
            status = f"{GREEN}✓{RESET}" if passed == total else f"{YELLOW}⚠{RESET}"
            print(f"{status} {category}: {passed}/{total}")
    
    print(f"\n{BLUE}Total: {passed_checks}/{total_checks} checks passed{RESET}")
    
    # Recommendations
    print_header("Recommendations")
    
    if not check_module("openai", ""):
        print(f"{YELLOW}→{RESET} Install OpenAI for GPT-3.5-turbo support:")
        print(f"  pip install openai")
    
    if not check_module("ollama", ""):
        print(f"{YELLOW}→{RESET} Install Ollama for local LLM support:")
        print(f"  pip install ollama")
        print(f"  Then download a model: ollama pull mistral")
    
    # Check GPU
    try:
        import torch
        if not torch.cuda.is_available():
            print(f"{YELLOW}→{RESET} GPU not detected. Using CPU (slower).")
            print(f"  For GPU support, install CUDA-enabled PyTorch:")
            print(f"  pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118")
    except:
        pass
    
    # Final status
    print_header("Status")
    
    if passed_checks >= total_checks - 2:  # Allow 2 optional failures
        print(f"{GREEN}✓ Setup is ready!{RESET}")
        print(f"\nNext steps:")
        print(f"1. Start backend: python app.py")
        print(f"2. In another terminal, start frontend: npm start")
        print(f"3. Open browser: http://localhost:3000/ai-tryon")
        return 0
    else:
        print(f"{RED}✗ Setup incomplete. Please install missing packages.{RESET}")
        print(f"\nRun: pip install -r requirements.txt")
        return 1

if __name__ == "__main__":
    sys.exit(main())
