import sqlite3
import os
import logging

logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), "tutor_sessions.db")


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database() -> None:
    conn = get_connection()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id                INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id        TEXT    NOT NULL,
                original_text     TEXT    NOT NULL,
                corrected_text    TEXT    NOT NULL,
                score             INTEGER NOT NULL,
                vocabulary_score  INTEGER DEFAULT 8,
                confidence_score  INTEGER DEFAULT 8,
                is_correct        INTEGER NOT NULL,
                error_count       INTEGER NOT NULL,
                errors_json       TEXT    DEFAULT '[]',
                encouragement     TEXT    DEFAULT '',
                created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor = conn.execute("PRAGMA table_info(sessions)")
        columns = [column[1] for column in cursor.fetchall()]
        if "errors_json" not in columns:
            conn.execute("ALTER TABLE sessions ADD COLUMN errors_json TEXT DEFAULT '[]'")
        if "encouragement" not in columns:
            conn.execute("ALTER TABLE sessions ADD COLUMN encouragement TEXT DEFAULT ''")
        if "vocabulary_score" not in columns:
            conn.execute("ALTER TABLE sessions ADD COLUMN vocabulary_score INTEGER DEFAULT 8")
        if "confidence_score" not in columns:
            conn.execute("ALTER TABLE sessions ADD COLUMN confidence_score INTEGER DEFAULT 8")
        if "language" not in columns:
            conn.execute("ALTER TABLE sessions ADD COLUMN language TEXT DEFAULT 'en'")
        if "english_translation" not in columns:
            conn.execute("ALTER TABLE sessions ADD COLUMN english_translation TEXT DEFAULT ''")

        conn.commit()
        logger.info(f"Database initialized at: {DB_PATH}")
    finally:
        conn.close()
