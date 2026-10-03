# ModelLedger Contribution Guide

## Project

ModelLedger --- Prove Which AI Model Produced This

Repository:

`BNB26_Technites_Internal_Round`

------------------------------------------------------------------------

# 1. Team Ownership

### Mahi --- Blockchain + Backend + System Integration

Owns:

-   FastAPI backend
-   API orchestration
-   PostgreSQL integration
-   SHA-256 hashing
-   Provenance engine
-   Smart contracts
-   Blockchain/Web3 integration
-   Verification engine
-   Integration and deployment configuration

Main branches:

`mahi/blockchain-backend`

------------------------------------------------------------------------

### Faizan --- AI/ML

Owns:

-   `ai-engine/`
-   Artifact analysis
-   AI consistency analysis
-   Tampering/anomaly analysis
-   Classification
-   Confidence
-   Evidence generation

Main branch:

`faizan/ai-engine`

------------------------------------------------------------------------

### Aqif --- Frontend + UI/UX

Owns:

-   `frontend/`
-   Next.js/React UI
-   Dashboard
-   Artifact pages
-   Verification page
-   Provenance graph
-   Activity/history UI
-   Loading/error states

Main branch:

`aqif/frontend`

------------------------------------------------------------------------

# 2. Repository Structure

``` text
modelledger/
├── frontend/
├── backend/
├── ai-engine/
├── blockchain/
├── database/
├── docs/
├── README.md
├── API.md
├── CONTRIBUTING.md
└── .env.example
```

------------------------------------------------------------------------

# 3. Branch Rules

`main` is the stable shared branch.

Do not directly push feature work to `main`.

Each person works primarily on their own branch:

``` text
mahi/blockchain-backend
faizan/ai-engine
aqif/frontend
```

Changes are merged through Pull Requests.

------------------------------------------------------------------------

# 4. Commit Rules

Make commits small and meaningful.

Good:

``` text
feat: add artifact upload endpoint
feat: add provenance database model
feat: add blockchain registration
fix: handle missing artifact
ui: add verification status card
```

Avoid:

``` text
update
changes
final
test
asdf
```

------------------------------------------------------------------------

# 5. Pull Requests

Before opening a PR:

1.  Test your changes locally.
2.  Make sure your module still works.
3.  Check that you did not modify another person's module unnecessarily.
4.  Update documentation if an agreed interface changed.
5.  Explain what changed in the PR.

------------------------------------------------------------------------

# 6. API Contract Rule

`API.md` is the shared contract.

Do not silently change:

-   endpoint names
-   request fields
-   response fields
-   status values
-   field meanings

If a change is necessary:

1.  Tell the team.
2.  Update `API.md`.
3.  Update the affected module.
4.  Test the integration.

------------------------------------------------------------------------

# 7. Module Ownership

Avoid editing another person's core module unless explicitly
coordinated.

For example:

-   Aqif should not modify blockchain code.
-   Faizan should not modify FastAPI verification logic.
-   Mahi should not redesign Aqif's frontend.

If integration requires a change, discuss it first.

------------------------------------------------------------------------

# 8. AI Coding Tools

Different team members may use different AI coding tools.

This is allowed.

However, all generated code must follow:

-   existing architecture
-   existing folder structure
-   `API.md`
-   `CONTRIBUTING.md`
-   agreed tech stack
-   existing interfaces

Use this instruction with coding AI tools:

> You are working inside the existing ModelLedger repository. Do not
> redesign the architecture. Do not modify other team members' modules.
> Do not change API contracts without explicit approval. Follow API.md
> and CONTRIBUTING.md.

------------------------------------------------------------------------

# 9. Environment & Secrets

Never commit:

``` text
.env
.env.local
private keys
RPC credentials
API keys
passwords
database credentials
```

Use `.env.example` as the template.

------------------------------------------------------------------------

# 10. Dependencies

Do not introduce a major new framework or replace an existing technology
without discussing it with the team.

Avoid unnecessary dependencies.

------------------------------------------------------------------------

# 11. Integration Strategy

Development happens in this order:

``` text
Frontend ↔ FastAPI ↔ PostgreSQL
                  ↓
               Blockchain
                  ↓
              AI Engine
                  ↓
            Full Verification
```

Frontend can initially use mock data.

AI can initially return mock analysis.

Blockchain can initially use a local/test contract.

The goal is to unblock parallel development.

------------------------------------------------------------------------

# 12. Testing Before Merge

At minimum, test:

### Backend

-   artifact upload
-   SHA-256 generation
-   database storage
-   provenance creation
-   verification

### Blockchain

-   provenance registration
-   transaction confirmation
-   provenance retrieval
-   verification

### AI

-   valid artifact analysis
-   inconsistent/tampered artifact analysis
-   malformed input handling

### Frontend

-   upload flow
-   artifact display
-   verification result
-   provenance graph
-   error/loading states

------------------------------------------------------------------------

# 13. Security Rules

Never trust:

-   user-provided hashes
-   claimed model names
-   claimed provenance
-   AI output alone

Calculate the artifact hash on the backend.

Blockchain records are used as independent integrity/provenance
evidence.

------------------------------------------------------------------------

# 14. Demo Reliability

The final demo must work from a clean, predictable flow:

``` text
Upload Artifact
      ↓
Generate Hash
      ↓
Create Provenance
      ↓
Register Blockchain Record
      ↓
Run AI Analysis
      ↓
Verify
      ↓
Show Evidence
      ↓
Modify Artifact
      ↓
Verify Again
      ↓
Show TAMPERED / CONFLICT
```

Do not add experimental features immediately before the final demo.

------------------------------------------------------------------------

# 15. Golden Rule

**Architecture first. Integration second. Features third.**

If a change can break another person's work, discuss it before
implementing it.
