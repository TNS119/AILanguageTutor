import logging
from groq import Groq
from config import GROQ_API_KEY, WHISPER_MODEL, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE

logger = logging.getLogger(__name__)

client = Groq(api_key=GROQ_API_KEY)


def transcribe_audio(audio_path: str, language_code: str = DEFAULT_LANGUAGE) -> dict:
    lang_info = SUPPORTED_LANGUAGES.get(language_code, SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE])
    whisper_code = lang_info.get("whisper_code", "en")
    logger.info(f"Transcribing audio: {audio_path} using model: {WHISPER_MODEL} with language: {whisper_code}")

    with open(audio_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            file=audio_file,
            model=WHISPER_MODEL,
            language=whisper_code,
            response_format="json",
            temperature=0.0,
        )

    transcribed_text = transcription.text.strip()
    logger.info(f"Transcription result: '{transcribed_text}'")

    if not transcribed_text:
        raise ValueError(
            "No speech was detected in the audio. "
            "Please speak clearly into your microphone and try again."
        )

    return {
        "text": transcribed_text,
    }
