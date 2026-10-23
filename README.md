# Analytiq — AI-assisted hiring (UI prototype)

Analytiq is an applicant tracking system with explainable resume screening. Companies post jobs and candidates apply through a public careers page. Each resume is matched against the job's requirements, and recruiters see a 0–100 compatibility score along with the exact resume evidence behind it. **People make every hiring decision.** The AI only helps sort and explain.

> **Status: UI prototype with mock data.** Nothing is saved to a server. Changes you make (stage changes, notes) last until you reload the page.

**Live demo:** https://insaneabhi07.github.io/analytiq/

## What's in this repo

| Folder | What it is |
|---|---|
| `web/` | **React frontend** (Vite + React 18 + TypeScript + Tailwind CSS + Chart.js). This is what's deployed to GitHub Pages. |
| `src/Analytiq.Web/` | ASP.NET Core MVC (.NET 10) version of the same prototype, with Razor views and an in-memory mock data store. It's the starting point for the real backend (EF Core + SQL Server + Identity). |

Both versions use the same mock data and the same scoring formula.

## Screens

- **Landing page** with features, a responsible-AI section and pricing (sample prices)
- **Sign in / register company**
- **Recruiter dashboard**: KPIs, weekly applications, funnel, items needing attention, upcoming interviews, AI processing health
- **Jobs**: list, pipeline board per job, screening criteria, and a create form with an AI draft for the description
- **Candidates**: filterable and sortable screening table with bulk shortlist, hold and reject (a reason is required for rejection)
- **Candidate profile**: score breakdown, per-skill resume evidence (exact vs related matches), missing evidence, warnings, model and config version, resume preview, interviews, offer, notes and status history
- **Compare candidates** side by side, skill by skill (select 2–4 in the candidates table)
- **Interviews**: upcoming and past lists, a scheduling form with editable AI-suggested questions, and structured feedback (ratings, evidence, recommendation; locked once submitted)
- **Interviewer view** ("My interviews"): only assigned interviews, with no scores, salary or notes
- **Offers**: draft → sent → accepted/declined → joined, with compensation restricted to authorised roles
- **Analytics** and **Billing & usage** (demo billing mode)
- **Settings**: company profile, team and roles, departments, scoring weights, privacy and retention, integrations
- **Platform Super Admin** console: overview, companies (suspend, reactivate, assign plan, support-access request), plans, AI processing queue, security and audit log, system settings
- **Careers portal**: job search, job page, mobile-friendly application form with resume upload checks, confirmation, and status tracking for candidates

## How scoring works (prototype)

```
score = Σ(weight × coverage) / Σ(weights of criteria that could be assessed) × 100
weights: required skills 60 · preferred skills 20 · relevant experience 20
exact skill match = 1.0 credit · related skill (embedding similarity ≥ 0.70) = 0.7 credit
```

If a criterion can't be extracted reliably (for example, experience on a scanned resume), it's shown as **Unknown** and excluded, never guessed. Name, photo, gender, age, religion, caste and location are never used.

## Run locally

React app:

```bash
cd web
npm install
npm run dev        # http://localhost:5173/analytiq/
```

ASP.NET Core app (needs the .NET 10 SDK):

```bash
dotnet run --project src/Analytiq.Web --launch-profile http   # http://localhost:5217
```

## Deploy to GitHub Pages

```bash
cd web
npm run deploy     # builds and publishes dist/ to the gh-pages branch
```

The app uses hash routing (`/#/app/...`), so deep links work on static hosting.

## Next steps (not built yet)

- Real backend: EF Core + SQL Server, ASP.NET Core Identity, multi-tenant data isolation
- Python FastAPI AI service: PDF/DOCX text extraction, skill extraction, Sentence Transformers matching
- Background processing queue, private resume storage, audit log
- Payment gateway integration (currently demo billing mode only)

---

Built by **Abhishek Singh** ([@InsaneAbhi07](https://github.com/InsaneAbhi07)).
