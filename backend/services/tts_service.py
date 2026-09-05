import os
import logging
import edge_tts
from config import SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, TTS_VOICE

logger = logging.getLogger(__name__)


async def generate_speech(text: str, output_path: str, language_code: str = DEFAULT_LANGUAGE) -> str:
    if not text or not text.strip():
        raise ValueError("Cannot generate speech for an empty text.")

    lang_info = SUPPORTED_LANGUAGES.get(language_code, SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE])
    voice = lang_info.get("tts_voice", TTS_VOICE)

    logger.info(f"Generating TTS audio using voice: '{voice}' ({lang_info['name']}) for text: '{text[:60]}...'")

    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)

    logger.info(f"TTS audio saved successfully: {output_path}")
    return output_path
