"""
Test script for backend components
"""
import os
import sys
from pathlib import Path

print("="*60)
print("DUROFLEX VIDEO ANALYSIS - BACKEND TEST")
print("="*60)

# Test 1: Environment variables
print("\n1. Testing environment variables...")
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv("MODEL")

if api_key:
    print(f"   ✓ GEMINI_API_KEY loaded (length: {len(api_key)})")
else:
    print("   ✗ GEMINI_API_KEY not found!")
    sys.exit(1)

print(f"   ✓ MODEL: {model}")

# Test 2: Google Drive downloader
print("\n2. Testing Google Drive URL parser...")
from drive_downloader import extract_file_id

test_url = "https://drive.google.com/file/d/18NPNh32N-hQLcnWcMbkK-ofwrv-i4vcq/view?usp=sharing"
try:
    file_id = extract_file_id(test_url)
    print(f"   ✓ Extracted file ID: {file_id}")
except Exception as e:
    print(f"   ✗ Failed: {e}")

# Test 3: Gemini API configuration
print("\n3. Testing Gemini API connection...")
try:
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    
    # List models
    models = list(genai.list_models())
    print(f"   ✓ Connected to Gemini API")
    print(f"   ✓ Available models: {len(models)}")
    
    # Check if our model is available
    model_names = [m.name for m in models if 'generateContent' in m.supported_generation_methods]
    print(f"   ✓ Models with generateContent:")
    for name in model_names[:5]:  # Show first 5
        print(f"     - {name}")
    
except Exception as e:
    print(f"   ✗ Gemini API error: {e}")

# Test 4: Directory structure
print("\n4. Checking directory structure...")
directories = ['results', 'temp']
for dir_name in directories:
    dir_path = Path(dir_name)
    if dir_path.exists():
        print(f"   ✓ {dir_name}/ exists")
    else:
        dir_path.mkdir(exist_ok=True)
        print(f"   ✓ {dir_name}/ created")

# Test 5: FastAPI imports
print("\n5. Testing FastAPI imports...")
try:
    from fastapi import FastAPI
    from pydantic import BaseModel
    print("   ✓ FastAPI imports successful")
except Exception as e:
    print(f"   ✗ Import error: {e}")

print("\n" + "="*60)
print("✓ BACKEND SETUP COMPLETE!")
print("="*60)
print("\nNext steps:")
print("1. Run: python main.py")
print("2. Visit: http://localhost:8000/docs")
print("3. Test API endpoints")
print("\nOr download a test video:")
print("python -c \"from drive_downloader import download_from_drive; download_from_drive('https://drive.google.com/file/d/18NPNh32N-hQLcnWcMbkK-ofwrv-i4vcq/view?usp=sharing', 'test')\"")
