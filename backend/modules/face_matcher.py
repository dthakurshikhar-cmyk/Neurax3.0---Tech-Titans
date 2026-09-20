import cv2
import numpy as np
from deepface import DeepFace
from PIL import Image
import io
import requests

class BiometricMatcher:
    def __init__(self):
        # ArcFace provides high-accuracy 512-d facial embeddings
        self.model_name = "ArcFace"

    def get_embedding_from_bytes(self, image_bytes: bytes):
        """Converts raw image bytes to a face vector embedding."""
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            img_np = np.array(image)
            img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            
            embeddings = DeepFace.represent(
                img_path=img_bgr,
                model_name=self.model_name,
                enforce_detection=False
            )
            if embeddings and len(embeddings) > 0:
                return embeddings[0]["embedding"]
        except Exception as e:
            print(f"[Biometric Error] Failed to extract embedding: {e}")
        return None

    def get_embedding_from_url(self, image_url: str):
        """Downloads a public profile image URL and extracts facial vector."""
        try:
            resp = requests.get(image_url, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code == 200:
                return self.get_embedding_from_bytes(resp.content)
        except Exception as e:
            print(f"[Biometric Error] Failed to fetch url {image_url}: {e}")
        return None

    def compute_similarity(self, embedding1, embedding2):
        """Calculates Cosine Similarity between two face vectors."""
        if embedding1 is None or embedding2 is None:
            return 0.0
        
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        cosine_sim = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
        return round(float(cosine_sim), 4)
