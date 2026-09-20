import json
import traceback
import google.generativeai as genai
from config import GEMINI_API_KEY

class LLMCorrelator:
    def __init__(self):
        self.api_available = False
        if GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE":
            try:
                genai.configure(api_key=GEMINI_API_KEY)
                self.api_available = True
            except Exception as e:
                print(f"[LLM Config Error] Could not configure Gemini: {e}")

    def correlate_and_structure(self, target_name: str, scraped_sources: list, biometric_results: list):
        """Correlates unstructured OSINT data, builds timeline, and outputs JSON schema."""
        
        if not self.api_available:
            print("[LLM Warning] GEMINI_API_KEY is not set in config.py or environment. Running fallback.")
            return self._generate_fallback_response(
                target_name, scraped_sources, biometric_results, "API Key Missing or Unconfigured in config.py"
            )

        prompt = f"""
        You are a senior OSINT investigator analyzing intelligence for a hackathon candidate.
        Target Input Name: "{target_name}"

        Scraped Public Data / Web Footprint:
        {json.dumps(scraped_sources, indent=2)}

        Biometric Verification Results (Cosine Similarity against target photo):
        {json.dumps(biometric_results, indent=2)}

        Tasks:
        1. Resolve all handles, aliases, and usernames (e.g. github/devpost handles like sreenidhitinnaluri).
        2. Construct a detailed summary explaining EXACTLY why the confidence score was assigned.
        3. Extract all professional roles, affiliations, and university names (e.g., Malla Reddy Vishwavidyapeeth).
        4. Extract hackathons, competitions, conferences, projects (e.g., Codebase RAG, spam classifier), and publications.
        5. Build a chronological activity timeline with real dates/years and source evidence links.
        6. Construct a relationship graph with nodes (Person, Org, Project, Platform) and edges (STUDIES_AT, BUILT, CONTRIBUTED_TO, HAS_PROFILE).
        7. Flag any conflicting details, location mismatches, or missing biometric confirmation in `warnings_and_ambiguities`.

        Return ONLY a raw JSON object matching this schema (no markdown fences):
        {{
          "primary_identity": {{
            "name": "Full Name",
            "aliases": ["handle1", "handle2"],
            "summary": "Detailed narrative explaining verified identity and WHY confidence score was assigned.",
            "confidence_score": 92
          }},
          "verified_profiles": [
            {{"platform": "LinkedIn", "url": "...", "biometric_match_score": 0.85, "status": "Verified"}}
          ],
          "affiliations": [
            {{"organization": "University / Company", "role": "Student / AI Engineer", "evidence_url": "..."}}
          ],
          "events_and_hackathons": [
            {{"event_name": "Hackathon Name", "year": "2024", "role": "Participant", "evidence_url": "..."}}
          ],
          "projects_and_patents": [
            {{"title": "Project Title", "type": "Repository / Project", "url": "..."}}
          ],
          "warnings_and_ambiguities": [],
          "timeline": [
            {{"time": "2024", "title": "Project / Event Name", "description": "Details of activity", "source": "URL"}}
          ],
          "graph": {{
            "nodes": [{{"id": "1", "label": "Target Name", "type": "Person"}}, {{"id": "2", "label": "GitHub", "type": "Platform"}}],
            "edges": [{{"source": "1", "target": "2", "label": "HAS_PROFILE"}}]
          }}
        }}
        """

        # Priority candidates ordered by current availability
        candidate_models = [
            "gemini-2.5-flash",
            "gemini-1.5-flash",
            "gemini-2.0-flash",
            "gemini-2.5-pro"
        ]

        # Dynamically append any other active models from the API catalog as backups
        try:
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    clean_name = m.name.replace("models/", "")
                    if clean_name not in candidate_models:
                        candidate_models.append(clean_name)
        except Exception:
            pass

        last_error = None
        for model_name in candidate_models:
            try:
                print(f"[LLM] Attempting generation with model: {model_name}")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                
                clean_json = response.text.replace("```json", "").replace("```", "").strip()
                result_data = json.loads(clean_json)
                print(f"[LLM Success] Successfully correlated OSINT data using {model_name}")
                return result_data
            except Exception as e:
                print(f"[LLM Attempt Failed] Model '{model_name}' failed: {e}")
                last_error = e

        print("[LLM Execution Error] All candidate models failed during Gemini calls.")
        return self._generate_fallback_response(target_name, scraped_sources, biometric_results, str(last_error))

    def _generate_fallback_response(self, target_name, scraped_sources, biometric_results, error_reason):
        profiles = []
        for b in biometric_results:
            profiles.append({
                "platform": b.get("platform", "Web"),
                "url": b.get("url"),
                "biometric_match_score": b.get("similarity", 0.0),
                "status": "Verified" if b.get("similarity", 0.0) >= 0.60 else "Unverified"
            })

        return {
            "primary_identity": {
                "name": target_name,
                "aliases": [target_name.lower().replace(" ", "")],
                "summary": f"Basic footprint gathered. LLM synthesis failed: {error_reason}",
                "confidence_score": 50
            },
            "verified_profiles": profiles,
            "affiliations": [],
            "events_and_hackathons": [],
            "projects_and_patents": [],
            "warnings_and_ambiguities": [f"LLM Error: {error_reason}"],
            "timeline": [],
            "graph": {
                "nodes": [{"id": "1", "label": target_name, "type": "Person"}],
                "edges": []
            }
        }
