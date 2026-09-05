# AI Voice Language Tutor — Multilingual Speaking Practice App

A production-grade, interactive speaking practice application with full multilingual support for **English**, **हिन्दी (Hindi)**, and **తెలుగు (Telugu)** built on the **LLMs Meet Speech** concept.

---

## 📋 What It Does

- **Multilingual Voice Practice**: Switch effortlessly between **English**, **Hindi (Devanagari)**, and **Telugu** via the Header Navbar selector.
- **Voice Pipeline**: Microphone $\rightarrow$ Speech-to-Text (Groq Whisper with language hint) $\rightarrow$ Linguistic Evaluation (Groq LLaMA/Qwen) $\rightarrow$ Natural Text-to-Speech (Microsoft Edge TTS Neural) $\rightarrow$ Audio Playback.
- **Option A Bilingual Explanations**: When practicing in Hindi or Telugu, grammar errors are broken down with both native script corrections and simple English explanations for clear comprehension.
- **Spoken Error Filtering**: Focuses strictly on real spoken errors (verb tense/aspect, gender-number agreement, case markers/postpositions, word order) while ignoring transcription artifacts.
- **Progress Tracking & Analytics**: Evaluates Overall Score (1–10), Vocabulary Richness (1–10), and Speaking Confidence (1–10) with historical logs tagged by language.

---

## 🛠️ Multilingual Tech Stack

| Component | English (`en`) | Hindi (`hi`) | Telugu (`te`) |
|---|---|---|---|
| **STT** | Groq Whisper (`en`) | Groq Whisper (`hi`) | Groq Whisper (`te`) |
| **LLM** | Groq LLaMA/Qwen (`en` rules) | Groq LLaMA/Qwen (काल, लिंग, कारक) | Groq LLaMA/Qwen (విభక్తులు, కాలాలు) |
| **TTS** | `en-US-JennyNeural` | `hi-IN-SwaraNeural` | `te-IN-ShrutiNeural` |
| **Feedback Mode** | Direct English explanation | Bilingual (Hindi + English) | Bilingual (Telugu + English) |
| **Backend** | Python + FastAPI | Python + FastAPI | Python + FastAPI |
| **Frontend** | React + Vite + Tailwind CSS (Impeccable craft with Devanagari & Telugu font tuning) |

---

## ⚡ Local Development

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Copy environment variables template and add your Groq API key
cp .env.example .env

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```
- Backend runs at: `http://localhost:8000`
- Interactive API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
- Frontend runs at: `http://localhost:5173`

---

## 🔑 Environment Variables

Configure these variables in `backend/.env` or on your hosting provider:

```env
GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
WHISPER_MODEL=whisper-large-v3
LLM_MODEL=qwen/qwen3.8-27b
MAX_AUDIO_SIZE_MB=10
TTS_VOICE=en-US-JennyNeural
```

---

## 🚀 Deployment

### Backend $\rightarrow$ Render
1. Create a **Web Service** on [Render](https://render.com).
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variable: `GROQ_API_KEY=your_groq_key`

### Frontend $\rightarrow$ Vercel
1. Import project on [Vercel](https://vercel.com).
2. Set **Root Directory**: `frontend`
3. Set Framework Preset: `Vite`
4. Add Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`

---

## 🏗️ Project Architecture

```
AILanguageTutor/
├── backend/
│   ├── main.py             # FastAPI entrypoint (/api/analyze, /api/languages, /api/progress)
│   ├── config.py           # SUPPORTED_LANGUAGES registry (en, hi, te) & model configurations
│   ├── requirements.txt    # Backend Python dependencies
│   ├── .env.example        # Environment variables template
│   ├── services/
│   │   ├── stt_service.py  # Groq Whisper API integration with language hints
│   │   ├── llm_service.py  # Multilingual spoken evaluation & bilingual Option A prompts
│   │   └── tts_service.py  # Microsoft Edge TTS neural voice router
│   ├── database/
│   │   ├── db.py           # SQLite connection & schema migrations (language tag)
│   │   └── session_store.py# Language-filtered practice history & progress analytics
│   └── utils/
│       └── audio_utils.py  # Audio file validation & temp asset cleanup
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Top-level application container
│   │   ├── pages/
│   │   │   └── Home.jsx    # Impeccable polished multilingual workspace
│   │   ├── components/     # LanguageSelector, FeedbackCard, ProgressChart, RecordButton, ScoreBadge
│   │   ├── hooks/          # useAudioRecorder, useSession
│   │   └── services/api.js # API client with dynamic language parameters
│   ├── vercel.json         # Vercel SPA routing configuration
│   └── package.json        # Frontend dependencies & scripts
│
├── tests/                  # Automated pytest suite (STT, LLM bilingual feedback, TTS routing)
└── render.yaml             # Render cloud deployment blueprint
```
