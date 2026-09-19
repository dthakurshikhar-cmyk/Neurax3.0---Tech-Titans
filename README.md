# Neurax3.0-Tech-Titans

**AI-powered OSINT for verifiable, fraud-resistant hiring**

> Built for **Neurax Hackathon 3.0** — Domain 3: AI in Cybersecurity

---

## The Problem

A candidate's professional footprint is scattered across GitHub, LinkedIn, personal portfolios, academic repositories, and conference speaker lists — often under different usernames, aliases, or spellings. That fragmentation creates real risk on both sides of the hiring table:

| Who's affected | The pain point |
|---|---|
| **HR & Recruitment Teams** | Manual background checks are slow, tedious, and error-prone |
| **Trust & Security Teams** | Exposed to insider threats and spoofed digital identities |
| **Job Seekers** | No easy way to cryptographically prove their scattered achievements are genuinely theirs |

Bad-faith candidates exploit this friction to inflate credentials or claim work that isn't theirs. Legitimate candidates pay the price with slower, less trusting hiring cycles.

---

## Our Solution

An autonomous **OSINT (Open-Source Intelligence) and Resume Verification System** that turns a candidate's consented photo and resume metadata into a single, evidence-backed identity dossier — closing the gap between what a resume *claims* and what's *publicly verifiable*.

---

## How It Works

```mermaid
flowchart TD
    A[Candidate Consent & Input] --> B[Photo + Resume Name/Handle]
    B --> C[Initial Anchor Extraction]
    C --> D[Generate Name & Handle Variations]
    D --> E[Targeted OSINT Discovery]
    E --> F[Collect Public Profiles, Repos, Commits & Media]
    F --> G[Identity Correlation]
    G --> H[Tri-Factor Verification]
    H --> H1[Face Similarity]
    H --> H2[Writing Style]
    H --> H3[Contextual Links]
    H1 --> I[Identity Graph Construction]
    H2 --> I
    H3 --> I
    I --> J[Confidence Score Calculation]
    J --> K[Audit Log & Evidence Compilation]
    K --> L[Interactive Identity Dossier]
    L --> M[HR / Recruiter Verification]
```

### 1. Initial Anchor Extraction
The consented candidate photo is converted into a facial embedding vector, while resume data is used to generate likely name and handle variations.

- **Tools:** `InsightFace`, `OpenCV`

### 2. Targeted OSINT Discovery
Using those anchors, the system queries authorized public APIs, code repositories, and professional registries to harvest publicly accessible bios, commits, and media.

- **Tools:** `Python`, `FastAPI`

### 3. Identity Correlation & Verification
Rather than returning a raw list of links, discovered accounts are cross-referenced through a **Tri-Factor Verification** test:

- **Facial similarity**
- **Writing style analysis**
- **Contextual links** between profiles

- **Tools:** `NetworkX` (identity graph), local SLMs via `Ollama` / `Llama-3` (linguistic analysis)

### 4. Audit Reporting & Confidence Scoring
Verified identities are merged into a weighted trust score and compiled into an immutable audit log with direct source URLs — so HR teams can see exactly *why* an account was linked to a candidate.

- **Tools:** `Pydantic` (structured audit logs), `Streamlit` / `Next.js` (interactive frontend)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Computer Vision / Biometrics | InsightFace, OpenCV |
| Backend / Data Collection | Python, FastAPI |
| Graph & Relationship Mapping | NetworkX |
| Language Analysis | Ollama, Llama-3 (local SLMs) |
| Data Validation | Pydantic |
| Frontend | Streamlit or Next.js |

---

## Ethics & Compliance

This system is built around a strict consent-first, rights-respecting design:

- Operates only on **public, consented, and authorized** information
- No bypassing of access controls
- No use of leaked or breached databases
- Respects all platform rate limits and privacy guardrails

---

## Impacted Audiences

- **Corporate HR & Recruitment Teams** — faster, more reliable candidate vetting
- **Enterprise Trust & Security Teams** — reduced exposure to insider threats and identity spoofing
- **Job Seekers & Professionals** — a fast, verifiable way to showcase authentic accomplishments

---

## Status

Prototype built for Neurax Hackathon 3.0 (Domain 3: AI in Cybersecurity).
