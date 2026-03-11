# 🎙️ ResearchAI — Voice-Powered Research Agent

> **Gemini Live Agent Challenge Submission**
> Category: **Live Agents** 🗣️

---

## 📌 What It Does

ResearchAI is a voice-first AI research assistant powered by the **Gemini Live API**.
Speak any research topic and the agent:

1. **Plans** — Breaks your topic into focused subtopics
2. **Searches** — Searches the live web for each subtopic in real time
3. **Synthesizes** — Combines findings into a clear spoken summary
4. **Recommends** — Suggests papers, courses, and resources
5. **Ideates** — Proposes hands-on project ideas with tech stacks

All through **natural voice conversation** — interrupt anytime, ask follow-ups, go deeper.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         React + TypeScript              │
│         (Voice UI — Vite)               │
│                                         │
│  Mic → WebSocket → Speaker              │
└──────────────┬──────────────────────────┘
               │ WebSocket (audio stream)
               ▼
┌─────────────────────────────────────────┐
│         Python + FastAPI                │
│         Google Cloud Run                │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Google ADK Agent           │   │
│  │                                 │   │
│  │  Tools:                         │   │
│  │  • plan_research_subtopics()    │   │
│  │  • google_search (built-in)     │   │
│  │  • format_research_summary()    │   │
│  │  • suggest_followup_questions() │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │ Gemini Live API
               ▼
┌─────────────────────────────────────────┐
│    gemini-2.5-flash-native-audio        │
│    Google Gemini Live API               │
└─────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, TypeScript, Vite, CSS Modules |
| Backend    | Python 3.12, FastAPI, WebSockets    |
| AI Agent   | Google ADK, Gemini Live API         |
| Voice      | gemini-2.5-flash-native-audio       |
| Search     | ADK built-in google_search tool     |
| Deployment | Google Cloud Run                    |

---

## ✅ Hackathon Requirements Met

| Requirement | Status |
|---|---|
| Uses Gemini model | ✅ gemini-2.5-flash-native-audio |
| Built with Google ADK | ✅ Agent with 4 tools |
| Uses Gemini Live API | ✅ Real-time audio streaming |
| Multimodal (audio in/out) | ✅ Voice in → Voice out |
| Hosted on Google Cloud | ✅ Cloud Run |
| Real AI agent workflow | ✅ Plan → Search → Synthesize → Respond |
| Beyond text-in/text-out | ✅ Full voice interaction |

---

## 🚀 Running Locally

### Prerequisites
- Python 3.12+
- Node.js 18+
- Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate      # Mac/Linux
# .venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env → add your GOOGLE_API_KEY

# Start server
cd app
uvicorn main:app --reload --port 8080
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env → set VITE_WS_URL=ws://localhost:8080

# Start dev server
npm run dev
```

Open **http://localhost:5173**, click **Connect**, then click the **orb** and start talking.

---

## ☁️ Deploying to Google Cloud Run

### 1. Install & authenticate gcloud CLI

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com
```

### 3. Store API key in Secret Manager

```bash
echo -n "your_gemini_api_key" | \
  gcloud secrets create GOOGLE_API_KEY --data-file=-
```

### 4. Deploy backend to Cloud Run

```bash
cd backend

gcloud run deploy research-agent-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GOOGLE_API_KEY=GOOGLE_API_KEY:latest" \
  --set-env-vars="GOOGLE_GENAI_USE_VERTEXAI=FALSE" \
  --min-instances=1
```

### 5. Build & deploy frontend

```bash
cd frontend

# Set your Cloud Run backend URL
echo "VITE_WS_URL=wss://YOUR_BACKEND_URL.run.app" > .env

# Build
npm run build

# Deploy (using Firebase Hosting or Cloud Run)
gcloud run deploy research-agent-frontend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 📁 Project Structure

```
ai-research-agent/
├── backend/
│   ├── app/
│   │   ├── main.py                      # FastAPI + WebSocket server
│   │   ├── tools.py                     # Custom ADK research tools
│   │   └── research_agent/
│   │       ├── __init__.py
│   │       └── agent.py                 # ADK Agent definition
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceOrb.tsx             # Animated mic button
│   │   │   ├── StatusBar.tsx            # Header + connection state
│   │   │   ├── TranscriptPanel.tsx      # Live speech display
│   │   │   ├── ConversationHistory.tsx  # Message log sidebar
│   │   │   ├── AgentSteps.tsx           # Workflow step tracker
│   │   │   └── StarfieldCanvas.tsx      # Background animation
│   │   ├── hooks/
│   │   │   ├── useVoiceAgent.ts         # WebSocket + mic logic
│   │   │   └── useAudioPlayer.ts        # Audio queue + playback
│   │   ├── types/index.ts               # All TypeScript interfaces
│   │   └── styles/globals.css           # Design tokens
│   └── package.json
│
└── README.md
```

---

## 🎥 Demo

> [Link to demo video — record using Loom or OBS before submission]

---

## 👤 Author

Built for the **Gemini Live Agent Challenge** — Google × Devpost, 2026.
