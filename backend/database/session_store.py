import json
import logging
from typing import Any, Dict, List
from backend.database.db import get_connection

logger = logging.getLogger(__name__)


def save_session(
    session_id: str,
    original_text: str,
    corrected_text: str,
    score: int,
    is_correct: bool,
    error_count: int,
    vocabulary_score: int = 8,
    confidence_score: int = 8,
    errors: List[Any] = None,
    encouragement: str = "",
) -> None:
    conn = get_connection()
    try:
        errors_json = json.dumps(errors or [])
        conn.execute(
            """
            INSERT INTO sessions
                (session_id, original_text, corrected_text, score, vocabulary_score, confidence_score, is_correct, error_count, errors_json, encouragement)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (session_id, original_text, corrected_text, score, vocabulary_score, confidence_score, int(is_correct), error_count, errors_json, encouragement),
        )
        conn.commit()
        logger.info(f"Session saved for session_id={session_id}, score={score}, vocab={vocabulary_score}, confidence={confidence_score}")
    finally:
        conn.close()


def get_progress(session_id: str) -> Dict[str, Any]:
    conn = get_connection()
    try:
        stats = conn.execute(
            """
            SELECT
                COUNT(*)                                          AS total_sessions,
                ROUND(AVG(score), 1)                              AS average_score,
                ROUND(AVG(vocabulary_score), 1)                   AS average_vocab_score,
                ROUND(AVG(confidence_score), 1)                   AS average_confidence_score,
                SUM(CASE WHEN score = 10 THEN 1 ELSE 0 END)      AS perfect_count
            FROM sessions
            WHERE session_id = ?
            """,
            (session_id,),
        ).fetchone()

        total = stats["total_sessions"] or 0
        average = stats["average_score"] or 0.0
        average_vocab = stats["average_vocab_score"] or 0.0
        average_confidence = stats["average_confidence_score"] or 0.0
        perfect = stats["perfect_count"] or 0

        improvement_trend = "Not enough data yet (practice more!)"
        if total >= 4:
            half = total // 2

            early_avg = conn.execute(
                """
                SELECT AVG(score) FROM (
                    SELECT score FROM sessions
                    WHERE session_id = ?
                    ORDER BY created_at ASC
                    LIMIT ?
                )
                """,
                (session_id, half),
            ).fetchone()[0] or 0

            recent_avg = conn.execute(
                """
                SELECT AVG(score) FROM (
                    SELECT score FROM sessions
                    WHERE session_id = ?
                    ORDER BY created_at DESC
                    LIMIT ?
                )
                """,
                (session_id, half),
            ).fetchone()[0] or 0

            if recent_avg > early_avg + 0.5:
                improvement_trend = "📈 Improving!"
            elif recent_avg < early_avg - 0.5:
                improvement_trend = "📉 Needs more practice"
            else:
                improvement_trend = "➡️ Steady progress"

        recent_rows = conn.execute(
            """
            SELECT id, original_text, corrected_text, score, vocabulary_score, confidence_score, is_correct, error_count, errors_json, encouragement, created_at
            FROM sessions
            WHERE session_id = ?
            ORDER BY created_at DESC
            LIMIT 20
            """,
            (session_id,),
        ).fetchall()

        recent_sessions = []
        for row in recent_rows:
            item = dict(row)
            try:
                item["errors"] = json.loads(item.get("errors_json") or "[]")
            except Exception:
                item["errors"] = []
            recent_sessions.append(item)

        return {
            "total_sessions": total,
            "average_score": average,
            "average_vocab_score": average_vocab,
            "average_confidence_score": average_confidence,
            "perfect_count": perfect,
            "improvement_trend": improvement_trend,
            "recent_sessions": recent_sessions,
        }

    finally:
        conn.close()
