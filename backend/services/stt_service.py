import logging
from groq import Groq
from config import GROQ_API_KEY, WHISPER_MODEL, TARGET_LANGUAGE_CODE

logger = logging.getLogger(__name__)

client = Groq(api_key=GROQ_API_KEY)


def transcribe_audio(audio_path: str) -> dict:
    logger.info(f"Transcribing audio: {audio_path} using model: {WHISPER_MODEL}")

    with open(audio_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            file=audio_file,
            model=WHISPER_MODEL,
            language=TARGET_LANGUAGE_CODE,
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
