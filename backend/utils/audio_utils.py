import os
import logging

logger = logging.getLogger(__name__)


def validate_audio_file(file_path: str, max_size_mb: int = 10) -> None:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    size_bytes = os.path.getsize(file_path)

    if size_bytes == 0:
        raise ValueError(
            "The audio file is empty. Did the recording capture any sound? "
            "Please try again and make sure your microphone is working."
        )

    size_mb = size_bytes / (1024 * 1024)
    if size_mb > max_size_mb:
        raise ValueError(
            f"Audio file is too large ({size_mb:.1f} MB). "
            f"Maximum allowed size is {max_size_mb} MB. "
            "Please record a shorter sentence."
        )

    logger.info(f"Audio file validated: {size_mb:.2f} MB at {file_path}")


def cleanup_file(file_path: str) -> None:
    if not file_path:
        return

    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.debug(f"Cleaned up temp file: {file_path}")
    except OSError as e:
        logger.warning(f"Could not delete temp file {file_path}: {e}")
