# Neurax3.0-Tech-Titans

## The Problem

A person's digital footprint is scattered across GitHub, LinkedIn, personal portfolios, academic repositories, and conference speaker lists — often under different usernames, aliases, or spellings. When an organization only has a small starting point (a photo, a name, a company), piecing together a verified picture of that person is slow and error-prone:

| Who's affected | The pain point |
|---|---|
| **Organizations & Verification Teams** | Manual identity checks are slow, tedious, and easy to get wrong |
| **Trust & Security Teams** | Exposed to insider threats and spoofed or impersonated identities |
| **Individuals** | Have no easy way to have their scattered, genuine public presence quickly and accurately confirmed |

Fragmented, inconsistent identifiers make it easy for bad actors to hide behind misleading or fabricated profiles — and hard for legitimate identities to be confirmed quickly.

---

## Our Solution

An autonomous **OSINT (Open-Source Intelligence) Identity Verification System**. The user starts by entering a photo, with a name and company as optional extras. From there, the AI engine takes over: it embeds the photo into a facial vector and, if a name was given, predicts a set of likely usernames based on naming patterns and other identifying traits (if no name is provided, it simply skips this prediction step and works from the face alone). The system then spins up a temporary working directory and starts pulling in data — searching for facial matches across the web and keeping only the ones that clear a high-confidence threshold. Every candidate match is rechecked against what else has been found (repos, social bios, hackathons, company records, and more) before it's accepted, and the facial data itself is continuously re-audited to converge on the single best match. The end result is a verified, evidence-backed identity dossier handed to the requesting organization.

What sets this apart from a simple rules-based lookup is a layer of custom AI woven through the process: a **custom-trained fusion model** learns how to weigh and combine facial similarity, textual, and contextual signals into one calibrated confidence score, rather than relying on a hand-tuned average. An **adaptive query agent** reasons about where to search next — spotting a mentioned employer or project in one profile and automatically generating new, targeted OSINT queries around it. Profile bios, posts, and commit messages are embedded into a shared vector space for **semantic matching**, so the system recognizes the same person even when names or wording differ across platforms. A dedicated **anomaly detection** model flags contradictions across sources — conflicting employers, timelines, or claimed skills — for human review instead of silently averaging them away. And verifier decisions feed back into the system, letting the fusion model's weighting **continuously improve** over time.

---

## How It Works

1. **Initialization** — The user submits a photo (required), plus an optional name and company. Nothing else is needed to start.
2. **Facial Embedding & Username Prediction** — The photo is converted into a facial embedding vector. If a name was provided, the AI predicts a set of likely usernames and handles based on naming patterns and identifying traits; if no name is given, this step is skipped and the search proceeds on the face alone.
3. **Temporary Data Workspace** — The system spins up a temporary directory to stage all data fetched during the search.
4. **Confidence-Guided Face Search** — The engine searches for visually similar faces across public sources, keeping only matches that clear a high-confidence threshold.
5. **Cross-Source Rechecking** — Every retained match is repeatedly rechecked against everything else found so far — repositories, social bios, hackathon listings, company records, and more — to confirm it truly belongs to the same person.
6. **Facial Audit** — The facial data is continuously re-audited throughout the process to converge on the single best match.
7. **Final Reporting** — Verified findings are compiled into:
   - An **evidence graph** showing how and why each match was made
   - A **timeline** (laid out like a number line) of jobs, hackathons, and other milestones
   - A **full log dump** of every verified data point acquired

---

## Tech Stack

| Layer | Technology |
|---|---|
| Computer Vision / Biometrics | InsightFace, OpenCV |
| Backend / Data Collection | Python, FastAPI |
| Graph & Relationship Mapping | NetworkX |
| Language Analysis | Ollama, Llama-3 (local SLMs) |
| Custom Fusion & Scoring Model | Custom-trained model (in-house) |
| Data Validation | Pydantic |
| Frontend | Streamlit or Next.js |

---

## Ethics & Compliance

This system is built around a strict consent-first, rights-respecting design. It works only with information the user has explicitly agreed to submit, and every finding traces back to a public source:

- Operates only on **public, consented, and authorized** information
- No bypassing of access controls
- No use of leaked or breached databases
- Respects all platform rate limits and privacy guardrails

---

## Impacted Audiences

- **Organizations & Verification Teams** — faster, more reliable identity checks with minimal input
- **Enterprise Trust & Security Teams** — reduced exposure to insider threats and identity spoofing
- **Individuals** — a fast, verifiable way to confirm their genuine public presence

---

## Status

Prototype built for Neurax Hackathon 3.0 (Domain 3: AI in Cybersecurity).
