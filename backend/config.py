import os
from dotenv import load_dotenv

backend_dir = os.path.dirname(os.path.abspath(__file__))

load_dotenv(override=True)

GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "whisper-large-v3")
LLM_MODEL: str = os.getenv("LLM_MODEL", "qwen/qwen3.8-27b")

AUDIO_DIR: str = os.path.abspath(
    os.path.join(backend_dir, "temp_audio")
)

MAX_AUDIO_SIZE_MB: int = int(os.getenv("MAX_AUDIO_SIZE_MB", "10"))
TTS_VOICE: str = os.getenv("TTS_VOICE", "en-US-JennyNeural")

SUPPORTED_LANGUAGES = {
    "en": {
        "code": "en",
        "name": "English",
        "native_name": "English",
        "whisper_code": "en",
        "tts_voice": "en-US-JennyNeural",
        "sample_phrases": [
            "She don't like coffee in the morning.",
            "Yesterday I go to market with my friend.",
            "They is playing football outside.",
        ],
    },
    "hi": {
        "code": "hi",
        "name": "Hindi",
        "native_name": "हिन्दी",
        "whisper_code": "hi",
        "tts_voice": "hi-IN-SwaraNeural",
        "sample_phrases": [
            "वह कल स्कूल जाता था।",
            "हम दोनों कल बाजार जाऊंगा।",
            "मुझे ठंडी पानी पीना है।",
        ],
    },
    "te": {
        "code": "te",
        "name": "Telugu",
        "native_name": "తెలుగు",
        "whisper_code": "te",
        "tts_voice": "te-IN-ShrutiNeural",
        "sample_phrases": [
            "నేను నిన్న బడికి వెళ్తాను.",
            "ఆమె నిన్న రాత్రి అన్నం తింటాడు.",
            "మేము అందరం రేపు సినిమాకి వెళ్ళాము.",
        ],
    },
}

DEFAULT_LANGUAGE: str = "en"

