import os
import logging
import edge_tts
from backend.config import TTS_VOICE

logger = logging.getLogger(__name__)


async def generate_speech(text: str, output_path: str) -> str:
    if not text or not text.strip():
        raise ValueError("Cannot generate speech for an empty text string.")

    logger.info(f"Generating TTS for: '{text[:80]}...' using voice: {TTS_VOICE}")

    communicate = edge_tts.Communicate(text=text, voice=TTS_VOICE)
    await communicate.save(output_path)

    if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
        raise Exception(
            f"TTS generation failed — output file is missing or empty: {output_path}"
        )

    file_size_kb = os.path.getsize(output_path) / 1024
    logger.info(f"TTS audio saved: {output_path} ({file_size_kb:.1f} KB)")

    return output_path
