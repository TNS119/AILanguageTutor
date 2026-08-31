# AI Voice Language Tutor — Voice Practice App

A complete, interactive English speaking practice application built on the **LLMs Meet Speech** concept.

---

## 📋 What It Does

- **Voice Mode**: Microphone $\rightarrow$ Speech-to-Text (Groq Whisper) $\rightarrow$ Spoken Evaluation (Groq LLaMA/Qwen) $\rightarrow$ Text-to-Speech (Edge TTS) $\rightarrow$ Audio Playback & Feedback
- **Spoken Error Filtering**: Ignores written transcription artifacts (e.g. `pm` vs `p.m.`, capitalization) to focus strictly on real spoken grammar, vocabulary richness, and speaking confidence.
- **Progress Tracking & History**: Evaluates Vocabulary Score (1–10) and Speaking Confidence (1–10) alongside Overall Skill Level in an interactive split-screen dashboard.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
|---|---|---|
| **STT** | Groq Whisper (`whisper-large-v3`) | Fast, accurate speech transcription |
| **LLM** | Groq LLaMA / Qwen (`qwen/qwen3.8-27b`) | Evaluates spoken grammar, vocabulary, and confidence |
| **TTS** | Microsoft Edge TTS (`en-US-JennyNeural`) | Free, natural text-to-speech correction audio |
| **Backend** | Python + FastAPI | Clean REST API with SQLite session persistence |
| **Frontend** | React + Vite + Tailwind CSS | Responsive split-screen UI with sidebar dashboard |

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
│   ├── main.py             # FastAPI entrypoint (/api/analyze, /api/audio, /api/progress)
│   ├── config.py           # Centralized environment & model settings
│   ├── requirements.txt    # Backend Python dependencies
│   ├── .env.example        # Environment variables template
│   ├── services/
│   │   ├── stt_service.py  # Groq Whisper API integration
│   │   ├── llm_service.py  # Spoken evaluation & score calibration
│   │   └── tts_service.py  # Microsoft Edge TTS audio generation
│   ├── database/
│   │   ├── db.py           # SQLite connection & schema initialization
│   │   └── session_store.py# Practice history & progress analytics
│   └── utils/
│       └── audio_utils.py  # Audio file validation & temp asset cleanup
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Top-level application container
│   │   ├── pages/
│   │   │   └── Home.jsx    # Main voice practice workspace page
│   │   ├── components/     # ProgressChart, RecordButton, FeedbackCard, ScoreBadge, AudioPlayer
│   │   ├── hooks/          # useAudioRecorder, useSession
│   │   └── services/api.js # API client for backend communication
│   ├── vercel.json         # Vercel SPA routing configuration
│   └── package.json        # Frontend dependencies & scripts
│
└── render.yaml             # Render cloud deployment blueprint
```

