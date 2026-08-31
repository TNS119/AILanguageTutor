import os
from dotenv import load_dotenv

load_dotenv(override=True)

GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "whisper-large-v3")
LLM_MODEL: str = os.getenv("LLM_MODEL", "qwen/qwen3.8-27b")

AUDIO_DIR: str = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "temp_audio")
)

MAX_AUDIO_SIZE_MB: int = int(os.getenv("MAX_AUDIO_SIZE_MB", "10"))

TTS_VOICE: str = os.getenv("TTS_VOICE", "en-US-JennyNeural")

TARGET_LANGUAGE: str = "English"
TARGET_LANGUAGE_CODE: str = "en"
