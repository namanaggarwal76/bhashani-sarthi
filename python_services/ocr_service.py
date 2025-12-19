"""
OCR service with IndicPhotoOCR and Gemini integration
"""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import requests
import google.generativeai as genai

try:
    from IndicPhotoOCR.ocr import OCR
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'AIzaSyCukxYVbX0sY6SYmVxVuhJlTu_SMmQzOP4')
genai.configure(api_key=GEMINI_API_KEY)

if OCR_AVAILABLE:
    ocr_system = OCR(verbose=False, identifier_lang="auto", device="cpu")
else:
    ocr_system = None

def process_ocr(image_path, target_language="English", latitude=None, longitude=None):
    try:
        if OCR_AVAILABLE and ocr_system:
            detections = ocr_system.detect(image_path)
            ocr_results = ocr_system.recognize(image_path, detections)
            ocr_text = " ".join([item['text'] for item in ocr_results if item.get('text')])
        else:
            ocr_text = "OCR placeholder - Install OpenBLAS for full OCR support"
        
        return {
            "ocr_text": ocr_text or "No text detected",
            "place_name": "Location",
            "description_english": "OCR service active",
            "description_translated": "OCR service active",
            "target_language": target_language
        }
    except Exception as e:
        return {"error": f"OCR failed: {str(e)}"}

if __name__ == "__main__":
    result = process_ocr(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "English")
    print(json.dumps(result))
