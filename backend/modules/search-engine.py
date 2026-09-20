from duckduckgo_search import DDGS
import requests
from config import SERPAPI_KEY, TARGET_PLATFORMS

class OSINTSearchEngine:
    def __init__(self):
        self.ddgs = DDGS()

    def discover_profiles(self, target_name: str):
        """Performs dorking across social, code, and professional sites."""
        discovered_links = []
        
        # 1. Platform-Specific Dorking
        for platform in TARGET_PLATFORMS:
            query = f'"{target_name}" site:{platform}'
            results = self._search_ddg(query, max_results=3)
            for r in results:
                discovered_links.append({
                    "platform": platform.split('.')[0].capitalize(),
                    "title": r.get("title", ""),
                    "url": r.get("href", r.get("link", "")),
                    "snippet": r.get("body", r.get("snippet", ""))
                })

        # 2. General Public Footprint Dorking (Events, Hackathons, News)
        event_query = f'"{target_name}" (hackathon OR conference OR speaker OR paper OR patent OR company)'
        event_results = self._search_ddg(event_query, max_results=5)
        for r in event_results:
            discovered_links.append({
                "platform": "Web/Event",
                "title": r.get("title", ""),
                "url": r.get("href", r.get("link", "")),
                "snippet": r.get("body", r.get("snippet", ""))
            })

        return self._deduplicate(discovered_links)

    def _search_ddg(self, query: str, max_results: int = 3):
        """Zero-cost search via DuckDuckGo API."""
        try:
            return list(self.ddgs.text(query, max_results=max_results))
        except Exception as e:
            print(f"[Search Engine Warning] DDG search failed for query '{query}': {e}")
            return self._search_serpapi(query) if SERPAPI_KEY else []

    def _search_serpapi(self, query: str):
        """Fallback to SerpAPI if key is available."""
        try:
            url = f"https://serpapi.com/search.json?q={query}&api_key={SERPAPI_KEY}"
            resp = requests.get(url, timeout=5).json()
            return resp.get("organic_results", [])
        except Exception:
            return []

    def _deduplicate(self, links):
        seen = set()
        deduped = []
        for l in links:
            if l["url"] not in seen and l["url"]:
                seen.add(l["url"])
                deduped.append(l)
        return deduped
