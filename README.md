# 🚀 LeadPilot — AI-Powered Real Estate Lead Prioritization & Sales Copilot

**LeadPilot** is an enterprise-grade AI web application designed for real-estate sales teams to automatically qualify inbound leads, calculate deterministic priority scores, recommend actionable next steps, generate grounded customer sales responses, and seamlessly schedule follow-up appointments on Google Calendar.

---

## 🌐 Live Working Links

- 🖥️ **Live Web Application (Frontend)**: [https://leadpilot-frontend-4jv0.onrender.com](https://leadpilot-frontend-4jv0.onrender.com)
- ⚡ **Live REST API (Backend)**: [https://leadpilot-backend-nsik.onrender.com](https://leadpilot-backend-nsik.onrender.com)
- 📖 **Interactive API Documentation (Swagger)**: [https://leadpilot-backend-nsik.onrender.com/docs](https://leadpilot-backend-nsik.onrender.com/docs)
- 🔒 **Privacy Policy**: [https://leadpilot-frontend-4jv0.onrender.com/privacy](https://leadpilot-frontend-4jv0.onrender.com/privacy)

---

## 🌟 Core Features & AI Intelligence

1. **AI Lead Intake & Qualification**:
   - Captures comprehensive customer inquiry data (`Name`, `Location`, `Property requirement`, `Budget`, `Timeline`, `Message`).
   - Uses **Google Gemini API** (`google-genai` SDK) to parse unstructured messages into structured sales intelligence (summary, intent, sub-scores, key requirements, objections, recommended next action, suggested response).

2. **Multi-Tier AI Provider Fallback Architecture**:
   - **Primary**: Google Gemini 3.1 Flash Lite (`gemini-3.1-flash-lite`)
   - **Secondary Fallback**: Groq AI (`llama-3.3-70b-versatile` / `grok-3-mini-fast`)
   - **Rule-Based Fallback**: Heuristic scoring engine ensuring **100% uptime** even during API provider outages.

3. **Deterministic Priority Scoring Engine**:
   - Computes an objective priority score (0–100) using a weighted formula:
     $$\text{priority\_score} = 0.35 \times \text{intent} + 0.30 \times \text{timeline} + 0.20 \times \text{requirement} + 0.15 \times \text{budget\_clarity}$$
   - Automatically maps scores to priority badges:
     - 🔥 **HOT** (80–100)
     - ☀️ **WARM** (50–79)
     - ❄️ **COLD** (0–49)
   - Generates human-explainable priority reasons for sales reps.

4. **Interactive Sales Dashboard**:
   - Live metrics counters for Total, Hot, Warm, and Cold leads.
   - Instant search by lead name, location, or property requirement.
   - Filter leads by priority tier and automatically sort by highest priority score.

5. **Scannable Lead Detail Intelligence**:
   - Breakdown of intent, sub-scores, key requirements, friction points, and objections.
   - 1-click copy for AI-suggested customer messages.

6. **Grounded Conversational Sales Copilot**:
   - Contextual AI chatbot attached to each lead.
   - Strictly grounded in selected lead context to prevent hallucinations.
   - Rich UI formatting with section header cards, metric badges (budgets, scores, priority labels), styled bullet cards, customer quote callouts, and 1-click answer copying.
   - Quick prompt chips (*"What should I emphasize on the call?"*, *"What are the customer's biggest concerns?"*, *"Make my reply more assertive"*).

7. **Google Calendar Integration**:
   - Google OAuth 2.0 authorization for seamless calendar connection.
   - 1-click **"Schedule Follow-up"** modal with custom date, time, and duration pickers.
   - Automatically pre-fills event details, lead context, talking points, and suggested responses into Google Calendar.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Router v6, Context API.
- **Backend**: Python 3.12, FastAPI, Pydantic v2, `google-genai` SDK, `httpx`, `groq` SDK.
- **Integrations**: Google Calendar API & Google OAuth 2.0.
- **Deployment**: Render (Web Service for Backend, Static Site for Frontend).

---

## 💻 How to Run the Project on Your Own System (Local Setup)

Follow these step-by-step instructions to run LeadPilot locally on your machine:

### 1. Prerequisites
- **Python**: Version 3.10 or higher
- **Node.js**: Version 18 or higher (with `npm`)
- **Git**: Installed on your system

---

### 2. Clone the Repository
Open your terminal and clone the project:
```bash
git clone https://github.com/aashixh0/Masal-AI-Assignment.git
cd Masal-AI-Assignment
```

---

### 3. Environment Variables Configuration
Copy the `.env.example` file to create your local `.env` configuration:

```bash
cp .env.example .env
```

Open `.env` in your code editor and fill in your API credentials:
```env
# Gemini API Key (Get from https://aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite

# Optional: Groq API Key (Get from https://console.groq.com)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Google OAuth Credentials (Optional for local calendar integration)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173

# Server Settings
HOST=127.0.0.1
PORT=8000
```

---

### 4. Backend Setup & Launch (FastAPI)

1. **Create and activate a Python virtual environment**:
   - **On Windows**:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **On macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server**:
   ```bash
   python run.py
   ```

   The backend will start on **`http://localhost:8000`**.  
   - Interactive Swagger API Documentation: **`http://localhost:8000/docs`**  
   - Health Check: **`http://localhost:8000/api/health`**

---

### 5. Frontend Setup & Launch (React + Vite)

Open a **new terminal window** in the project directory:

1. **Install Node.js packages**:
   ```bash
   npm install
   ```

2. **Start the Vite development server**:
   ```bash
   npm run dev
   ```

3. **Open the web app**:  
   Navigate to **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing

LeadPilot includes an end-to-end backend automated test suite verifying all 5 core requirements, AI qualification, scoring accuracy, copilot grounding, and calendar scheduling:

Run the test suite:
```bash
python test_backend.py
```

---

## 📁 Repository Structure

```
Masal-AI-Assignment/
├── app/
│   ├── main.py                  # FastAPI application entry point & CORS configuration
│   ├── core/
│   │   └── config.py            # Environment configuration & settings
│   ├── schemas/
│   │   └── lead.py              # Pydantic data schemas (Lead, AI Analysis, Copilot)
│   ├── services/
│   │   ├── ai_service.py        # Gemini & Groq multi-tier AI fallback engine
│   │   ├── scoring_service.py   # Deterministic priority scoring algorithm
│   │   └── lead_service.py      # Thread-safe in-memory lead repository & pre-seeded data
│   ├── integrations/
│   │   └── calendar_service.py  # Google Calendar API & OAuth 2.0 authorization
│   ├── prompts/
│   │   └── lead_prompts.py      # Structured system prompts for Gemini/Groq
│   └── routes/                  # API routes (/leads, /auth, /calendar, /health)
├── src/
│   ├── components/              # Modular React UI components
│   │   ├── copilot/             # CopilotDrawer & structured message formatting
│   │   ├── dashboard/           # LeadCard, LeadFilters, StatsBar
│   │   ├── layout/              # Navbar header & branding
│   │   └── modals/              # CreateLeadModal & ScheduleCalendarModal
│   ├── pages/                   # DashboardPage, LeadDetailPage, PrivacyPage
│   ├── context/                 # LeadContext provider & state management
│   ├── services/                # API client HTTP functions
│   ├── App.jsx                  # React Router configuration
│   └── index.css                # Tailwind CSS design system
├── public/                      # Static assets & SPA routing (_redirects)
├── .env.example                 # Environment variables template
├── package.json                 # Node.js dependencies & scripts
├── Procfile                     # Production process configuration for deployment
├── requirements.txt             # Python dependencies
├── run.py                       # Server runner
└── test_backend.py              # Automated test suite
```
