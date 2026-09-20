# 1. BAKE IN THE PROTOBUF VERSION BYPASS AT THE VERY TOP
import os
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json

from modules.face_matcher import BiometricMatcher
from modules.search_engine import OSINTSearchEngine
from modules.scraper import WebScraper
from modules.llm_correlator import LLMCorrelator

app = FastAPI(title="NEURAX OSINT Digital Identity Intelligence Pipeline")

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Core Processing Engines
biometrics = BiometricMatcher()
search_engine = OSINTSearchEngine()
scraper = WebScraper()
correlator = LLMCorrelator()

@app.get("/api/health")
def health_check():
    return {"status": "online", "system": "OSINT Footprint Engine"}

@app.post("/api/investigate")
async def investigate_target(
    name: str = Form(...),
    image: UploadFile = File(...)
):
    try:
        # Step 1: Process Target Image
        image_bytes = await image.read()
        seed_embedding = biometrics.get_embedding_from_bytes(image_bytes)
        if seed_embedding is None:
            print("[Warning] No clear face detected in seed image. Proceeding with text-based dorking.")

        # Step 2: OSINT Web Dorking
        discovered_links = search_engine.discover_profiles(name)

        # Step 3 & 4: Scrape Profiles & Perform Biometric Matching
        scraped_data = []
        biometric_results = []

        for item in discovered_links[:8]: # Process top 8 relevant results for speed
            scraped = scraper.scrape_url(item["url"])
            scraped_data.append({
                "platform": item["platform"],
                "url": item["url"],
                "snippet": item["snippet"],
                "content": scraped["markdown"][:1500]
            })

            # Compare avatar biometrics if avatar URL exists
            similarity = 0.0
            if scraped["avatar_url"] and seed_embedding is not None:
                avatar_embedding = biometrics.get_embedding_from_url(scraped["avatar_url"])
                # FIX: Verify the avatar face embedding was actually generated successfully
                if avatar_embedding is not None:
                    similarity = biometrics.compute_similarity(seed_embedding, avatar_embedding)

            biometric_results.append({
                "url": item["url"],
                "platform": item["platform"],
                "avatar_url": scraped["avatar_url"],
                "similarity": similarity
            })

        # Step 5: LLM Correlation & Graph Synthesis
        intelligence_report = correlator.correlate_and_structure(
            target_name=name,
            scraped_sources=scraped_data,
            biometric_results=biometric_results
        )

        return {
            "success": True,
            "data": intelligence_report
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
