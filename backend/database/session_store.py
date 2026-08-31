import json
import logging
from typing import Any, Dict, List
from database.db import get_connection

logger = logging.getLogger(__name__)


def save_session(
    session_id: str,
    original_text: str,
    corrected_text: str,
    score: int,
    vocabulary_score: int,
    confidence_score: int,
    is_correct: bool,
    error_count: int,
    errors: List[Dict[str, Any]],
    encouragement: str,
) -> int:
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO sessions (
                session_id, original_text, corrected_text, score,
                vocabulary_score, confidence_score, is_correct, error_count,
                errors_json, encouragement
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                session_id,
                original_text,
                corrected_text,
                score,
                vocabulary_score,
                confidence_score,
                1 if is_correct else 0,
                error_count,
                json.dumps(errors),
                encouragement,
            ),
        )
        conn.commit()
        record_id = cursor.lastrowid
        logger.info(f"Saved session record ID={record_id} for session_id='{session_id}'")
        return record_id
    finally:
        conn.close()


def get_progress(session_id: str) -> Dict[str, Any]:
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            SELECT
                COUNT(*) as total_sessions,
                AVG(score) as average_score,
                AVG(vocabulary_score) as average_vocab_score,
                AVG(confidence_score) as average_confidence_score,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as perfect_count
            FROM sessions
            WHERE session_id = ?
            """,
            (session_id,),
        )
        stats = dict(cursor.fetchone())

        total = stats["total_sessions"] or 0
        avg_score = round(stats["average_score"] or 0, 1)
        avg_vocab = round(stats["average_vocab_score"] or 0, 1)
        avg_conf = round(stats["average_confidence_score"] or 0, 1)
        perfect = stats["perfect_count"] or 0

        cursor = conn.execute(
            """
            SELECT id, original_text, corrected_text, score, vocabulary_score, confidence_score,
                   is_correct, error_count, errors_json, encouragement, created_at
            FROM sessions
            WHERE session_id = ?
            ORDER BY id DESC
            LIMIT 10
            """,
            (session_id,),
        )
        recent_rows = [dict(row) for row in cursor.fetchall()]

        recent_sessions = []
        for row in recent_rows:
            try:
                row["errors"] = json.loads(row.get("errors_json") or "[]")
            except Exception:
                row["errors"] = []
            recent_sessions.append(row)

        trend = _compute_trend(recent_sessions)

        return {
            "total_sessions": total,
            "average_score": avg_score,
            "average_vocab_score": avg_vocab,
            "average_confidence_score": avg_conf,
            "perfect_count": perfect,
            "improvement_trend": trend,
            "recent_sessions": recent_sessions,
        }
    finally:
        conn.close()


def _compute_trend(recent_sessions: List[Dict[str, Any]]) -> str:
    if len(recent_sessions) < 2:
        return "Keep practicing to see your improvement trend!"

    scores = [s["score"] for s in recent_sessions[:5]]
    earlier = scores[-1]
    latest = scores[0]

    if latest > earlier:
        return f"📈 Improving! Your score went from {earlier}/10 to {latest}/10."
    elif latest < earlier:
        return f"Keep going! Your recent score was {latest}/10."
    else:
        return f"Consistent performance at {latest}/10! Push for flawless sentences."
