import os
import logging
import edge_tts
from config import TTS_VOICE

logger = logging.getLogger(__name__)


async def generate_speech(text: str, output_path: str) -> str:
    if not text or not text.strip():
        raise ValueError("Cannot generate speech for an empty text.")

    logger.info(f"Generating TTS audio using voice: '{TTS_VOICE}' for text: '{text[:60]}...'")

    communicate = edge_tts.Communicate(text, TTS_VOICE)
    await communicate.save(output_path)

    logger.info(f"TTS audio saved successfully: {output_path}")
    return output_path
