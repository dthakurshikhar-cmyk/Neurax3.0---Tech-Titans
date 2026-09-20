import requests
from bs4 import BeautifulSoup
import re

class WebScraper:
    def __init__(self):
        # Uses Jina AI Reader API (100% Free Endpoint for Clean Markdown Conversion)
        self.jina_prefix = "https://r.jina.ai/"

    def scrape_url(self, url: str):
        """Fetches clean text in Markdown format and finds candidate profile images."""
        markdown_text = ""
        avatar_url = None

        try:
            # 1. Fetch Markdown content via Jina Reader
            jina_url = f"{self.jina_prefix}{url}"
            resp = requests.get(jina_url, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code == 200:
                markdown_text = resp.text[:4000] # Cap text for processing efficiency

            # 2. Directly scrape DOM for profile avatar images
            avatar_url = self._extract_avatar(url)
        except Exception as e:
            print(f"[Scraper Error] Could not process {url}: {e}")

        return {
            "url": url,
            "markdown": markdown_text,
            "avatar_url": avatar_url
        }

    def _extract_avatar(self, url: str):
        """Attempts to locate profile image from meta tags or common avatar elements."""
        try:
            resp = requests.get(url, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'html.parser')
                
                # Check OpenGraph image tags
                og_image = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "twitter:image"})
                if og_image and og_image.get("content"):
                    return og_image["content"]

                # Fallback to scanning <img> tags with avatar attributes
                for img in soup.find_all("img"):
                    src = img.get("src", "")
                    if any(k in src.lower() for k in ["avatar", "profile", "user", "headshot"]):
                        if src.startswith("http"):
                            return src
        except Exception:
            pass
        return None
