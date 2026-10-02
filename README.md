# 🚀 LeadPilot — AI-Powered Real Estate Lead Prioritization & Sales Copilot

**LeadPilot** is a production-looking MVP web application designed for real-estate sales teams to automatically qualify inbound leads, calculate deterministic priority scores, recommend the next best action, generate grounded sales responses, and seamlessly schedule follow-up events on Google Calendar.

---

## 🌟 Key Features

1. **Lead Intake & AI Qualification**:
   - Collects lead details (`Name`, `Location`, `Property requirement`, `Budget`, `Timeline`, `Customer inquiry/message`).
   - Uses **Google Gemini API** (`google-genai` SDK) to produce structured intelligence (summary, intent, sub-scores, key requirements, objections, recommended next action, suggested response).

2. **Deterministic Priority Scoring Engine**:
   - Computes score (0–100) using a transparent formula:
     $$\text{priority\_score} = 0.35 \times \text{intent} + 0.30 \times \text{timeline} + 0.20 \times \text{requirement} + 0.15 \times \text{budget\_clarity}$$
   - Maps score to priority badges:
     - **HOT** (80–100)
     - **WARM** (50–79)
     - **COLD** (0–49)
   - Generates human-explainable priority reasons.

3. **Interactive Sales Dashboard**:
   - Metric counters for Total, Hot, Warm, and Cold leads.
   - Real-time search and priority filtering.
   - Default sorting by highest priority leads.

4. **Scannable Lead Detail Page**:
   - Detailed breakdown of customer requirements and objections.
   - 1-click copy for AI suggested customer responses.

5. **Grounded Conversational AI Copilot**:
   - Context-aware chatbot attached to each lead.
   - Quick prompt chips (*"What should I emphasize on the call?"*, *"What are the customer's biggest concerns?"*, *"Make my reply more assertive"*).
   - Strictly grounded in selected lead context to prevent hallucinations.

6. **Google Calendar Follow-up Scheduling**:
   - 1-click **"Schedule Follow-up"** trigger with date, time, and duration picker.
   - Automatically populates event description with lead context, talking points, and suggested responses.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Router v6, Context API.
- **Backend**: Python 3.12, FastAPI, Pydantic v2, `google-genai` SDK, `httpx`.
- **Integrations**: Google Calendar API & Google OAuth 2.0.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js v18+

### 1. Clone & Configure Environment

```bash
git clone https://github.com/aashixh0/Masal-AI-Assignment.git
cd Masal-AI-Assignment
```

Copy environment template:
```bash
cp .env.example .env
```
Fill in your `GEMINI_API_KEY` in `.env`.

### 2. Backend Setup & Launch

```bash
# Install dependencies
pip install -r requirements.txt

# Run backend server
python run.py
```
FastAPI server runs on **`http://localhost:8000`**.  
Interactive API Documentation: **`http://localhost:8000/docs`**.

### 3. Frontend Setup & Launch

In a separate terminal window:
```bash
# Install frontend packages
npm install

# Start Vite development server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing

Run the end-to-end backend test suite:
```bash
python test_backend.py
```

---

## 📁 Repository Structure

```
Masal-AI-Assignment/
├── app/
│   ├── main.py                  # FastAPI application entry point & CORS
│   ├── core/
│   │   └── config.py            # Environment configuration
│   ├── schemas/
│   │   └── lead.py              # Pydantic schemas (Lead, AI Analysis, Copilot)
│   ├── services/
│   │   ├── ai_service.py        # Gemini API integration & fallback logic
│   │   ├── scoring_service.py   # Deterministic priority scoring algorithm
│   │   └── lead_service.py      # Thread-safe in-memory repository
│   ├── integrations/
│   │   └── calendar_service.py  # Google Calendar API & OAuth handler
│   ├── prompts/
│   │   └── lead_prompts.py      # Gemini system prompts
│   └── routes/                  # API endpoints (/leads, /auth, /calendar, /health)
├── src/
│   ├── components/              # React components (Dashboard, Modals, Copilot)
│   ├── pages/                   # DashboardPage & LeadDetailPage
│   ├── context/                 # LeadContext provider
│   ├── services/                # API client
│   ├── App.jsx                  # App routing
│   └── index.css                # Tailwind design system
├── .env.example                 # Environment variables template
├── package.json                 # Node dependencies
├── requirements.txt             # Python dependencies
├── run.py                       # Server runner
└── test_backend.py              # Automated test suite
```
