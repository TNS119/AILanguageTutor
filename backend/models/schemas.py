from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class GrammarError(BaseModel):
    original: str = Field(description="The incorrect word or phrase as spoken")
    corrected: str = Field(description="The correct word or phrase")
    explanation: str = Field(description="Simple, friendly explanation of the mistake")
    error_type: str = Field(
        description="Category of error",
        examples=["grammar", "vocabulary", "spelling", "word_order"]
    )


class LanguageInfo(BaseModel):
    code: str
    name: str
    native_name: str
    sample_phrases: List[str]


class FeedbackResponse(BaseModel):
    request_id: str = Field(description="Unique ID for this request, used to fetch TTS audio")
    language: str = Field(default="en", description="Language code (en, hi, te)")
    transcribed_text: str = Field(description="What Whisper heard the learner say")
    corrected_text: str = Field(description="The grammatically correct version of the sentence")
    english_translation: Optional[str] = Field(default="", description="English translation of the corrected sentence")
    is_correct: bool = Field(description="True if no errors were found")
    overall_score: int = Field(description="Score from 1 (many errors) to 10 (perfect)", ge=1, le=10)
    vocabulary_score: int = Field(description="Vocabulary score from 1 to 10", ge=1, le=10, default=8)
    confidence_score: int = Field(description="Speaking confidence/fluency score from 1 to 10", ge=1, le=10, default=8)
    errors: List[GrammarError] = Field(description="List of individual mistakes found", default=[])
    encouragement: str = Field(description="A short, warm motivating message for the learner")
    tts_audio_url: str = Field(description="URL to fetch the TTS-generated MP3 of the corrected sentence")


class SessionRecord(BaseModel):
    id: int
    language: Optional[str] = "en"
    original_text: str
    corrected_text: str
    score: int
    vocabulary_score: Optional[int] = 8
    confidence_score: Optional[int] = 8
    is_correct: bool
    error_count: int
    created_at: str


class LanguageStats(BaseModel):
    total_sessions: int
    average_score: float
    average_vocab_score: float
    average_confidence_score: float
    perfect_count: int


class ProgressResponse(BaseModel):
    total_sessions: int = Field(description="Total number of sentences practiced")
    average_score: float = Field(description="Average score across all sessions")
    average_vocab_score: Optional[float] = 8.0
    average_confidence_score: Optional[float] = 8.0
    perfect_count: int = Field(description="Number of sessions with a perfect score (10/10)")
    improvement_trend: str = Field(description="Human-readable trend: improving / steady / needs practice")
    languages_breakdown: Optional[Dict[str, LanguageStats]] = Field(default_factory=dict)
    recent_sessions: List[SessionRecord] = Field(description="Last practice attempts")
