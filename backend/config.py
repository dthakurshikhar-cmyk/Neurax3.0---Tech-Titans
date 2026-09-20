import os
from dotenv import load_dotenv

# Load environment variables from the local .env file
load_dotenv()

# API Keys (Fetched securely from .env, NEVER hardcoded here)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

# Safety checks to warn if keys are missing
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY is missing! Please add it to your .env file.")
if not SERPAPI_KEY:
    print("WARNING: SERPAPI_KEY is missing! Please add it to your .env file.")

# Facial Recognition Settings
FACE_MATCH_THRESHOLD = 0.60  # Cosine similarity threshold for verification

# Target OSINT Search Dorks
TARGET_PLATFORMS = [
    "linkedin.com/in",
    "github.com",
    "x.com",
    "twitter.com",
    "instagram.com",
    "youtube.com",
    "patents.google.com",
    "medium.com",
    "kaggle.com"
]
