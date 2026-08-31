import json
import re
import logging
from groq import Groq
from config import GROQ_API_KEY, LLM_MODEL, TARGET_LANGUAGE

logger = logging.getLogger(__name__)

client = Groq(api_key=GROQ_API_KEY)


def _build_system_prompt() -> str:
    return (
        f"You are a friendly and encouraging {TARGET_LANGUAGE} language tutor for a VOICE-DRIVEN speaking app. "
        "The learner's speech has been transcribed using Speech-To-Text. "
        "CRITICAL RULE: Focus STRICTLY on SPOKEN errors (grammar tenses, subject-verb agreement, prepositions, articles, incorrect word choice). "
        "DO NOT flag written spelling, capitalization, or abbreviation punctuation differences (e.g., 'pm' vs 'p.m.', 'am' vs 'a.m.', 'ok' vs 'OK'). "
        "You MUST respond with ONLY a valid JSON object — no markdown, no explanation outside the JSON."
    )


def _build_user_prompt(text: str) -> str:
    return f"""Analyze this English sentence spoken by a language learner:

"{text}"

Respond with ONLY this JSON structure (no other text):

{{
  "corrected_text": "<the fully corrected sentence with standard punctuation>",
  "is_correct": <true if no spoken errors, false if there are spoken errors>,
  "overall_score": <integer 1-10, overall score reflecting grammar and vocabulary quality>,
  "vocabulary_score": <integer 1-10, evaluating word choice sophistication, variety, and appropriateness>,
  "confidence_score": <integer 1-10, evaluating natural speaking flow and phrasing completeness>,
  "errors": [
    {{
      "original": "<the incorrect word or phrase>",
      "corrected": "<the correct replacement>",
      "explanation": "<simple, friendly explanation — max 20 words>",
      "error_type": "<one of: grammar, vocabulary, word_order>"
    }}
  ],
  "encouragement": "<one warm, motivating sentence in English for the learner>"
}}

Strict rules for a VOICE-DRIVEN application:
- IGNORE written transcription artifacts: DO NOT flag 'pm' vs 'p.m.', 'am' vs 'a.m.', missing periods, or capitalization as errors.
- Only report real SPOKEN mistakes (e.g., "I go yesterday" -> "I went yesterday", "she don't" -> "she doesn't").
- If there are no spoken grammar/vocabulary mistakes, set "is_correct": true and "errors": [].

Scoring Calibration Rules (Fair & Motivating):
  0 errors = 10/10 (Perfect spoken English)
  1 error  = 9/10  (Minor spoken issue)
  2 errors = 8/10  (Good attempt)
  3 errors = 7/10  (Fair attempt)
  4+ errors = 6/10 or lower depending on severity

Vocabulary Accountability:
  Evaluate vocabulary richness separately in "vocabulary_score" (1-10). Strong, varied word choices boost the learner's overall score."""


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


def _is_spelling_or_formatting_artifact(err: dict) -> bool:
    if err.get("error_type") == "spelling":
        return True
    
    orig = err.get("original", "").strip().lower().replace(".", "").replace(" ", "")
    corr = err.get("corrected", "").strip().lower().replace(".", "").replace(" ", "")
    
    if orig == corr:
        return True
        
    return False


def _validate_response(data: dict) -> dict:
    required = ["corrected_text", "errors"]
    for field in required:
        if field not in data:
            raise ValueError(f"LLM response is missing required field: '{field}'")

    if isinstance(data.get("errors"), list):
        filtered_errors = [e for e in data["errors"] if not _is_spelling_or_formatting_artifact(e)]
        data["errors"] = filtered_errors

    data["is_correct"] = len(data["errors"]) == 0
    num_errors = len(data["errors"])

    if num_errors == 0:
        base_score = 10
    elif num_errors == 1:
        base_score = 9
    elif num_errors == 2:
        base_score = 8
    elif num_errors == 3:
        base_score = 7
    else:
        base_score = max(1, 6 - (num_errors - 4))

    vocab_score = data.get("vocabulary_score")
    if vocab_score is not None:
        vocab_score = max(1, min(10, int(vocab_score)))
    else:
        vocab_score = 8 if num_errors <= 1 else max(5, 10 - num_errors)

    if vocab_score >= 9 and base_score < 10:
        base_score = min(10, base_score + 1)
    elif vocab_score <= 4 and base_score > 3:
        base_score = max(1, base_score - 1)

    data["overall_score"] = base_score
    data["vocabulary_score"] = vocab_score
    data.setdefault("confidence_score", max(1, base_score))
    data.setdefault("encouragement", "Keep practicing — you're doing great!")

    data["overall_score"] = max(1, min(10, int(data["overall_score"])))
    data["confidence_score"] = max(1, min(10, int(data["confidence_score"])))

    return data


def analyze_grammar(text: str) -> dict:
    if not text or not text.strip():
        raise ValueError("Cannot analyze an empty sentence.")

    logger.info(f"Analyzing spoken English for: '{text[:100]}' using model: {LLM_MODEL}")

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
        temperature=0.2,
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
