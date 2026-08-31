# 🎙️ AI Voice Language Tutor

> **Project 4 — LLMs Meet Speech Take-Home Assessment**  
> An English speaking practice app powered by Groq Whisper (STT), LLaMA (LLM), and Microsoft Edge TTS.

---

## 📋 What It Does

Speak an English sentence → get instant grammar feedback → hear the corrected version spoken back.

```
Your Voice → Groq Whisper (transcription) → Groq LLaMA (grammar analysis) → Edge-TTS (audio) → Your Ears
```

**Example:**  
🗣️ You say: *"She don't like coffee"*  
✅ App corrects: *"She doesn't like coffee"*  
🔊 Plays back the corrected sentence

---

## 🏗️ Architecture

```
AILanguageTutor/
├── backend/                    # Python + FastAPI
│   ├── main.py                 # API routes: /api/analyze, /api/audio, /api/progress
│   ├── config.py               # All settings (models, voices, limits)
│   ├── services/
│   │   ├── stt_service.py      # Groq Whisper API (Speech-to-Text)
│   │   ├── llm_service.py      # Groq LLaMA (grammar + vocabulary analysis)
│   │   └── tts_service.py      # Microsoft Edge TTS (text-to-speech)
│   ├── database/
│   │   ├── db.py               # SQLite setup
│   │   └── session_store.py    # Progress tracking (stretch goal)
│   └── utils/
│       └── audio_utils.py      # File validation and cleanup
│
├── frontend/                   # React + Tailwind CSS (Vite)
│   └── src/
│       ├── App.jsx             # Root component — full state machine
│       ├── components/         # RecordButton, FeedbackCard, AudioPlayer, etc.
│       ├── hooks/              # useAudioRecorder, useSession
│       └── services/api.js     # All backend HTTP calls
│
└── tests/                      # Pytest unit tests
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **STT** | Groq Whisper API (`whisper-large-v3`) | Fast, accurate, free tier |
| **LLM** | Groq LLaMA (`llama-3.1-8b-instant`) | Structured JSON output, fast, free |
| **TTS** | Microsoft Edge TTS | Free, natural voices, no API key |
| **Backend** | Python + FastAPI | Async, auto-docs, clean structure |
| **Frontend** | React + Tailwind CSS + Vite | Fast builds, component-based UI |
| **Database** | SQLite | Zero setup, progress tracking |

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+
- A **Groq API key** (free at [console.groq.com](https://console.groq.com/keys))

### 1. Clone and set up the backend

```bash
# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Configure your API key

```bash
# Copy the template
copy .env.example .env

# Open .env and add your Groq key:
# GROQ_API_KEY=gsk_your_actual_key_here
```

### 3. Run the backend

```bash
uvicorn backend.main:app --reload
```
Backend runs at: **http://localhost:8000**  
Auto-generated API docs: **http://localhost:8000/docs**

### 4. Set up and run the frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: **http://localhost:5173**

---

## 🧪 Running Tests

```bash
# From the project root (with venv activated)
pytest tests/ -v
```

---

## 🚀 Deployment

### Backend → Render (Free Tier)
1. Push code to GitHub
2. Create a **Web Service** on [render.com](https://render.com)
3. Set:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables**: `GROQ_API_KEY=your_key`

### Frontend → Vercel (Free Tier)
1. Import GitHub repo at [vercel.com](https://vercel.com)
2. Set framework to **Vite**
3. Add **Environment Variable**: `VITE_API_URL=https://your-render-app.onrender.com`
4. Deploy

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `POST` | `/api/analyze` | Full pipeline: audio → transcript → feedback → TTS |
| `GET` | `/api/audio/{id}` | Serve generated TTS MP3 audio |
| `GET` | `/api/progress/{session_id}` | Learner progress data (stretch goal) |

---

## 🎯 Approach & Design Decisions

### 1. Thoughtful LLM Prompting
The grammar analysis prompt (`llm_service.py`) uses:
- **Schema-in-prompt**: The exact JSON schema is embedded, ensuring parseable output
- **Temperature 0.3**: Low enough for consistent corrections, slight variation for encouragement
- **`response_format={"type": "json_object"}`**: Forces JSON mode on Groq
- **Regex fallback**: Extracts JSON even if the model wraps it in markdown fences
- **Field validation**: Catches incomplete responses and fills safe defaults

### 2. Service Separation
Each concern lives in its own file (`stt_service.py`, `llm_service.py`, `tts_service.py`).
This means you can swap the TTS provider (e.g., to ElevenLabs) by changing ONE file.

### 3. No Login Required (Stretch Goal)
Session tracking uses a browser-generated UUID stored in `localStorage`.
No account needed — the session persists across page refreshes.

### 4. React Custom Hooks
`useAudioRecorder` wraps the complex MediaRecorder API. `RecordButton` just calls
`startRecording()` and `stopRecording()` — separation of logic and UI.

---

## ⚠️ Known Limitations

- **Groq free tier rate limits**: If many users use the app simultaneously, you may hit RPM limits (adjustable by upgrading Groq plan)
- **Audio format**: The browser outputs WebM/Opus. Groq Whisper accepts WebM directly — no conversion needed
- **TTS latency**: Edge-TTS takes ~0.5-1 second to generate audio (network dependent)
- **Session persistence**: Progress is stored per-browser. Clearing localStorage resets progress
- **English only**: Currently configured for English only (configurable in `config.py`)
- **Temp audio cleanup**: Files are cleaned up on server restart; long-running servers may accumulate files (manageable with a scheduled cleanup)

---

## 📄 License
MIT License — free to use for educational purposes.
