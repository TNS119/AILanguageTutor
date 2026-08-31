import json
import re
import logging
from groq import Groq
from backend.config import GROQ_API_KEY, LLM_MODEL, TARGET_LANGUAGE

logger = logging.getLogger(__name__)

client = Groq(api_key=GROQ_API_KEY)


def _build_system_prompt() -> str:
    return (
        f"You are a friendly and encouraging {TARGET_LANGUAGE} language tutor. "
        "Your job is to analyze a learner's sentence for grammar, vocabulary richness, and speaking confidence/fluency. "
        "You MUST respond with ONLY a valid JSON object — no markdown, no explanation outside the JSON. "
        "Be supportive and constructive in your feedback."
    )


def _build_user_prompt(text: str) -> str:
    return f"""Analyze this English sentence spoken by a language learner:

"{text}"

Respond with ONLY this JSON structure (no other text):

{{
  "corrected_text": "<the fully corrected sentence>",
  "is_correct": <true if no errors, false if there are errors>,
  "overall_score": <integer 1-10, overall grammar score>,
  "vocabulary_score": <integer 1-10, evaluating word choice sophistication and variety>,
  "confidence_score": <integer 1-10, evaluating natural speaking flow and phrasing completeness>,
  "errors": [
    {{
      "original": "<the incorrect word or phrase>",
      "corrected": "<the correct replacement>",
      "explanation": "<simple, friendly explanation — max 20 words>",
      "error_type": "<one of: grammar, vocabulary, spelling, word_order>"
    }}
  ],
  "encouragement": "<one warm, motivating sentence in English for the learner>"
}}

Scoring guide for overall_score, vocabulary_score, and confidence_score:
  10 = Perfect, natural, rich vocabulary, no errors
  8-9 = Minor issues or simple word choice
  6-7 = 1-2 grammar or vocabulary mistakes  
  4-5 = Multiple grammar/word choice errors
  1-3 = Significant errors throughout

If the sentence is already correct:
  - Set "is_correct" to true
  - Set "errors" to an empty array []
  - Set overall_score, vocabulary_score, and confidence_score appropriately (8-10)
  - Write an enthusiastic encouragement message"""


def _parse_llm_response(raw_content: str) -> dict:
    try:
        return json.loads(raw_content)
    except json.JSONDecodeError:
        pass

    json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_content, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    json_match = re.search(r"\{.*\}", raw_content, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    logger.error(f"Could not parse LLM response: {raw_content[:500]}")
    raise ValueError(
        "The AI tutor returned an unreadable response. Please try again."
    )


def _validate_response(data: dict) -> dict:
    required = ["corrected_text", "errors"]
    for field in required:
        if field not in data:
            raise ValueError(f"LLM response is missing required field: '{field}'")

    data.setdefault("is_correct", len(data["errors"]) == 0)
    data.setdefault("overall_score", 10 if data["is_correct"] else 5)
    data.setdefault("vocabulary_score", max(1, data["overall_score"] - 1 if not data["is_correct"] else 9))
    data.setdefault("confidence_score", max(1, data["overall_score"]))
    data.setdefault("encouragement", "Keep practicing — you're doing great!")

    data["overall_score"] = max(1, min(10, int(data["overall_score"])))
    data["vocabulary_score"] = max(1, min(10, int(data["vocabulary_score"])))
    data["confidence_score"] = max(1, min(10, int(data["confidence_score"])))

    return data


def analyze_grammar(text: str) -> dict:
    if not text or not text.strip():
        raise ValueError("Cannot analyze an empty sentence.")

    logger.info(f"Analyzing grammar for: '{text[:100]}' using model: {LLM_MODEL}")

    response = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {
                "role": "system",
                "content": _build_system_prompt()
            },
            {
                "role": "user",
                "content": _build_user_prompt(text)
            }
        ],
        temperature=0.3,
        max_tokens=1024,
        response_format={"type": "json_object"},
    )

    raw_content = response.choices[0].message.content
    logger.debug(f"LLM raw response: {raw_content}")

    parsed = _parse_llm_response(raw_content)
    validated = _validate_response(parsed)

    logger.info(
        f"Analysis complete — Overall: {validated['overall_score']}/10, "
        f"Vocab: {validated['vocabulary_score']}/10, Confidence: {validated['confidence_score']}/10, "
        f"Errors: {len(validated['errors'])}, Correct: {validated['is_correct']}"
    )

    return validated
