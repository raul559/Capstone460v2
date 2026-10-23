import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if not api_key:
    raise SystemExit("No API key found. Set GOOGLE_API_KEY or GEMINI_API_KEY in .env or env.")

genai.configure(api_key=api_key)

for m in genai.list_models():
    if "generateContent" in getattr(m, "supported_generation_methods", []):
        print(m.name)
