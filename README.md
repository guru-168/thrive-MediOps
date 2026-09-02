# MediOps

### Know who needs you next.

MediOps is a clinical decision-support platform designed to help healthcare teams identify patients who are most likely to miss their next follow-up and understand **why**.

A missed follow-up is rarely just an empty appointment slot. It can mean delayed treatment, worsening conditions, and a patient quietly falling out of care.

MediOps turns that uncertainty into a prioritized, explainable workflow.

Experience **MediOps** live:

**[Open MediOps](https://thrive-healthcare.vercel.app/)**
---

## The problem

Hospitals and care teams manage large numbers of patients who require follow-up.

The challenge isn't simply knowing **who has a follow-up scheduled**.

It's knowing:

* Who is most likely to miss it?
* Which patients need attention first?
* What factors are driving that risk?
* Where should limited outreach effort be spent?

Traditional workflows often treat every follow-up equally.

MediOps doesn't.

---

## What MediOps does

MediOps analyzes patient-level signals and produces an **individual follow-up risk assessment**.

Each patient receives:

**Risk score → Risk level → Contributing factors → Recommended priority**

Instead of presenting a prediction as an unexplained number, MediOps makes the reasoning behind it visible.

> **The goal isn't to replace clinical judgment.**
>
> **It's to help clinicians know where to look first.**

---

## Core capabilities

### Risk prioritization

Patients can be ranked according to their likelihood of missing a follow-up, allowing care teams to focus outreach where it can have the greatest potential impact.

### Explainable predictions

Every prediction is accompanied by the factors contributing to the assessment.

Rather than:

> **Risk: 82%**

MediOps aims to answer:

> **Why is this patient high risk?**

This makes the system more transparent and actionable.

### Patient intelligence

A centralized patient view brings together relevant demographic, clinical, behavioral, and follow-up information needed to understand a patient's current risk.

### Follow-up workflow

High-risk patients can be surfaced as actionable follow-up priorities rather than remaining buried in a large patient list.

### Risk assessment

Care teams can evaluate individual patients and see how changes in their underlying signals affect the resulting risk assessment.

### Analytics

Aggregated insights provide a broader view of follow-up risk patterns and help teams understand where intervention demand is concentrated.

### Secure authentication

MediOps uses Supabase Authentication for account access, session management, protected routes, and sign-out.

---

# Explainability by design

Healthcare predictions should not be black boxes presented as unquestionable answers.

MediOps therefore treats explainability as part of the prediction itself.

For each assessment, the system surfaces the factors that contributed to the result and presents them in a form that care teams can understand.

This creates a simple chain:

```text
Patient
   ↓
Signals
   ↓
Risk prediction
   ↓
Contributing factors
   ↓
Actionable priority
```

The system is intended to **support a clinician's decision**, not make the decision for them.

---

# Risk prediction

The backend contains a calibrated machine-learning prediction pipeline based around XGBoost.

The prediction layer is designed with a fallback mechanism so that the application can continue to provide a deterministic risk assessment when the trained model is unavailable.

This makes the prototype resilient while keeping the distinction between:

* model-backed prediction
* deterministic fallback behavior

explicit.

### Example output

```json
{
  "risk_score": 0.78,
  "risk_level": "High",
  "factors": [
    "Previous missed appointments",
    "Longer travel distance",
    "Recent appointment history"
  ]
}
```

The exact factors depend on the patient data supplied to the model.

---

# From prediction to prioritization

A risk score by itself isn't enough.

Consider a hospital with 1,000 patients requiring follow-up.

Knowing that 120 patients are "high risk" still leaves the care team with a difficult question:

**Who should we contact first?**

MediOps addresses this by supporting patient ranking through the backend's prioritization flow.

```text
1000 patients
      ↓
Risk assessment
      ↓
Risk ranking
      ↓
Highest-priority patients
      ↓
Targeted outreach
```

This is the core idea behind the product:

> **Don't just predict risk. Prioritize attention.**

---

# Tech stack

### Frontend

| Technology   | Purpose                     |
| ------------ | --------------------------- |
| React        | UI framework                |
| TypeScript   | Type safety                 |
| Vite         | Development & build tooling |
| Tailwind CSS | Styling                     |
| React Router | Client-side routing         |
| Supabase JS  | Authentication              |

### Backend

| Technology     | Purpose                     |
| -------------- | --------------------------- |
| Python         | Backend runtime             |
| FastAPI        | REST API                    |
| Pydantic       | Request/response validation |
| Uvicorn        | ASGI server                 |
| XGBoost        | Risk prediction             |
| NumPy / Pandas | Data processing             |

---

# Project structure

```text
thrive-MediOps/
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   ├── profile/
│   │   └── ui/
│   │
│   ├── context/
│   │   └── AuthContext.tsx
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── OverviewPage.tsx
│   │   ├── PatientsPage.tsx
│   │   ├── RiskAssessmentPage.tsx
│   │   ├── FollowUpsPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── lib/
│   │   └── supabaseClient.ts
│   │
│   ├── router/
│   ├── services/
│   ├── data/
│   ├── hooks/
│   └── types/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   └── core/
│   │
│   ├── tests/
│   └── requirements.txt
│
├── public/
├── package.json
├── vite.config.ts
└── README.md
```

---

# Authentication

MediOps uses **Supabase Authentication** for application access.

The authentication layer provides:

* Email/password signup
* Email/password login
* Session persistence
* Protected application routes
* Public authentication routes
* Authenticated user state
* Secure sign-out
* Route redirection based on authentication state

The dashboard is protected, while `/login` and `/signup` remain publicly accessible.

### Environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Never commit `.env` or expose private service-role credentials.

---

# Getting started

## Prerequisites

Make sure you have:

* Node.js
* npm
* Python 3.10+
* Git

---

## 1. Clone the repository

```bash
git clone https://github.com/guru-168/thrive-MediOps.git
cd thrive-MediOps
```

---

## 2. Install frontend dependencies

```bash
npm install
```

---

## 3. Configure Supabase

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

---

## 4. Start the frontend

```bash
npm run dev
```

Vite will provide the local development URL.

---

## 5. Start the backend

From the project root:

```bash
cd backend
```

Create and activate a virtual environment if needed:

```bash
python -m venv .venv
```

### Windows

```bash
.venv\Scripts\activate
```

### macOS / Linux

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

---

# API

The backend exposes prediction and prioritization capabilities.

### Health

```http
GET /health
```

Used to verify backend availability.

### Prediction

```http
POST /predict
```

Accepts patient information and returns a risk assessment.

### Patient ranking

```http
POST /patients/rank
```

Ranks patients according to their predicted follow-up risk.

The backend also exposes readiness/model-status information to distinguish model availability from fallback operation.

---

# Development

Run the frontend linter:

```bash
npm run lint
```

Run the production build:

```bash
npm run build
```

Backend tests are located under:

```text
backend/tests/
```

---

# Data & prototype boundaries

MediOps is currently a **prototype / decision-support system**, not a production clinical system.

The project uses synthetic or illustrative patient information for demonstration purposes.

No real patient data should be entered into a development or demo deployment.

The prediction system should be evaluated and clinically validated before being considered for real-world clinical use.

MediOps is designed to support healthcare professionals — **not replace clinical judgment**.

---

# Design philosophy

The interface intentionally avoids the visual language of generic healthcare administration software.

MediOps follows a restrained clinical design system:

* Clear information hierarchy
* Minimal visual noise
* Monochrome visual language
* Strong typography
* Consistent spacing
* Focused interaction states
* Risk information presented without unnecessary decoration
* Explanations placed alongside predictions

The interface is designed around one question:

> **What does the care team need to know next?**

---

# Why this matters

A patient missing a follow-up appointment can be easy to interpret as a scheduling problem.

But behind that missed appointment could be:

* a patient who cannot travel,
* someone who repeatedly misses appointments,
* someone who is disengaging from care,
* or someone whose circumstances have changed.

MediOps is built around the idea that **risk should be surfaced before the missed appointment happens**.

The earlier a care team can identify a potentially vulnerable follow-up, the earlier they can decide whether intervention is appropriate.

---

# Roadmap

Potential future directions include:

* Integration with real hospital information systems
* Longitudinal patient risk tracking
* Automated outreach workflows
* Appointment reminder integrations
* More granular risk explanations
* Model monitoring and drift detection
* Clinician feedback loops
* Fairness and subgroup performance analysis
* Production-grade audit logging
* Role-based access control
* Clinical validation

---

# Important note

MediOps is a technology prototype created to explore predictive follow-up risk and explainable clinical prioritization.

It is **not a medical device, diagnostic system, or substitute for professional medical judgment**.

Any deployment involving real patient information would require appropriate security, privacy, clinical validation, governance, and regulatory review.

---

## Built with a simple idea

Healthcare teams already have too much information.

The challenge is knowing **what deserves attention first**.

**MediOps is built to make that decision clearer.**

> **Predict risk. Explain it. Prioritize care.**

---
