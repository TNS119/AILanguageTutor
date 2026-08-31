import os
import uuid
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from backend.config import AUDIO_DIR, MAX_AUDIO_SIZE_MB
from backend.services.stt_service import transcribe_audio
from backend.services.llm_service import analyze_grammar
from backend.services.tts_service import generate_speech
from backend.utils.audio_utils import validate_audio_file, cleanup_file
from backend.database.db import initialize_database
from backend.database.session_store import save_session, get_progress

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting AI Voice Language Tutor backend...")

    os.makedirs(AUDIO_DIR, exist_ok=True)
    logger.info(f"Temp audio directory: {AUDIO_DIR}")

    initialize_database()

    logger.info("✅ Server ready! Visit /docs for the API documentation.")

    yield

    logger.info("Shutting down — cleaning up temporary audio files...")
    for temp_file in Path(AUDIO_DIR).glob("*"):
        cleanup_file(str(temp_file))
    logger.info("Shutdown complete.")


app = FastAPI(
    title="AI Voice Language Tutor",
    description=(
        "A Duolingo-style English speaking practice app. "
        "Speak a sentence → get grammar feedback → hear the correction."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "message": "AI Voice Language Tutor is running"}


@app.post("/api/analyze", tags=["Core Pipeline"])
async def analyze_speech(
    audio: UploadFile = File(..., description="Recorded audio file (WebM, WAV, MP3, etc.)"),
    session_id: str = Form(default=None, description="Browser session UUID for progress tracking"),
):
    request_id = str(uuid.uuid4())[:8]
    audio_path = os.path.join(AUDIO_DIR, f"{request_id}_input.webm")
    tts_path = os.path.join(AUDIO_DIR, f"{request_id}_tts.mp3")

    try:
        audio_bytes = await audio.read()
        with open(audio_path, "wb") as f:
            f.write(audio_bytes)

        logger.info(f"[{request_id}] Audio received: {len(audio_bytes) / 1024:.1f} KB")

        validate_audio_file(audio_path, max_size_mb=MAX_AUDIO_SIZE_MB)

        stt_result = transcribe_audio(audio_path)
        transcribed_text = stt_result["text"]
        logger.info(f"[{request_id}] Transcribed: '{transcribed_text}'")

        feedback = analyze_grammar(transcribed_text)
        logger.info(
            f"[{request_id}] Score: {feedback['overall_score']}/10, Vocab: {feedback.get('vocabulary_score', 8)}/10, "
            f"Confidence: {feedback.get('confidence_score', 8)}/10, Errors: {len(feedback['errors'])}"
        )

        await generate_speech(feedback["corrected_text"], tts_path)

        if session_id and session_id.strip():
            save_session(
                session_id=session_id,
                original_text=transcribed_text,
                corrected_text=feedback["corrected_text"],
                score=feedback["overall_score"],
                vocabulary_score=feedback.get("vocabulary_score", 8),
                confidence_score=feedback.get("confidence_score", 8),
                is_correct=feedback["is_correct"],
                error_count=len(feedback["errors"]),
                errors=feedback["errors"],
                encouragement=feedback.get("encouragement", ""),
            )

        return JSONResponse(content={
            "request_id": request_id,
            "transcribed_text": transcribed_text,
            "corrected_text": feedback["corrected_text"],
            "is_correct": feedback["is_correct"],
            "overall_score": feedback["overall_score"],
            "vocabulary_score": feedback.get("vocabulary_score", 8),
            "confidence_score": feedback.get("confidence_score", 8),
            "errors": feedback["errors"],
            "encouragement": feedback["encouragement"],
            "tts_audio_url": f"/api/audio/{request_id}",
        })

    except ValueError as e:
        logger.warning(f"[{request_id}] Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    except FileNotFoundError as e:
        logger.error(f"[{request_id}] File error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while processing your audio. Please try again."
        )

    finally:
        cleanup_file(audio_path)


@app.get("/api/audio/{request_id}", tags=["Core Pipeline"])
def serve_audio(request_id: str):
    audio_path = os.path.join(AUDIO_DIR, f"{request_id}_tts.mp3")

    if not os.path.exists(audio_path):
        raise HTTPException(
            status_code=404,
            detail="Audio file not found. It may have expired — please try again."
        )

    return FileResponse(
        path=audio_path,
        media_type="audio/mpeg",
        filename=f"correction_{request_id}.mp3",
    )


@app.get("/api/progress/{session_id}", tags=["Progress Tracking"])
def get_session_progress(session_id: str):
    try:
        progress = get_progress(session_id)
        return JSONResponse(content=progress)
    except Exception as e:
        logger.error(f"Error fetching progress for session {session_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not retrieve progress data.")
