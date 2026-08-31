import json
import pytest
from unittest.mock import MagicMock, patch


def make_mock_response(content: dict) -> MagicMock:
    mock_choice = MagicMock()
    mock_choice.message.content = json.dumps(content)
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]
    return mock_response


class TestAnalyzeGrammar:

    def test_returns_structured_feedback(self):
        llm_output = {
            "corrected_text": "She went to school yesterday.",
            "is_correct": False,
            "overall_score": 6,
            "errors": [
                {
                    "original": "go",
                    "corrected": "went",
                    "explanation": "Use 'went' (past tense) for past events.",
                    "error_type": "grammar"
                }
            ],
            "encouragement": "Great effort! Keep practicing past tense."
        }

        with patch("backend.services.llm_service.client") as mock_client:
            mock_client.chat.completions.create.return_value = make_mock_response(llm_output)

            from backend.services.llm_service import analyze_grammar
            result = analyze_grammar("She go to school yesterday.")

        assert result["is_correct"] is False
        assert result["overall_score"] == 6
        assert len(result["errors"]) == 1
        assert result["errors"][0]["original"] == "go"
        assert result["corrected_text"] == "She went to school yesterday."

    def test_perfect_sentence(self):
        llm_output = {
            "corrected_text": "She went to school yesterday.",
            "is_correct": True,
            "overall_score": 10,
            "errors": [],
            "encouragement": "Perfect! Your grammar is excellent."
        }

        with patch("backend.services.llm_service.client") as mock_client:
            mock_client.chat.completions.create.return_value = make_mock_response(llm_output)

            from backend.services.llm_service import analyze_grammar
            result = analyze_grammar("She went to school yesterday.")

        assert result["is_correct"] is True
        assert result["overall_score"] == 10
        assert result["errors"] == []

    def test_handles_markdown_wrapped_json(self):
        inner_json = {
            "corrected_text": "I am happy.",
            "is_correct": True,
            "overall_score": 10,
            "errors": [],
            "encouragement": "Perfect sentence!"
        }
        markdown_wrapped = f"```json\n{json.dumps(inner_json)}\n```"

        mock_choice = MagicMock()
        mock_choice.message.content = markdown_wrapped
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]

        with patch("backend.services.llm_service.client") as mock_client:
            mock_client.chat.completions.create.return_value = mock_response

            from backend.services.llm_service import analyze_grammar
            result = analyze_grammar("I am happy.")

        assert result["is_correct"] is True

    def test_empty_text_raises_value_error(self):
        with patch("backend.services.llm_service.client"):
            from backend.services.llm_service import analyze_grammar

            with pytest.raises(ValueError, match="empty sentence"):
                analyze_grammar("")

    def test_score_clamped_to_valid_range(self):
        llm_output = {
            "corrected_text": "Hello.",
            "is_correct": True,
            "overall_score": 999,
            "errors": [],
            "encouragement": "Good!"
        }

        with patch("backend.services.llm_service.client") as mock_client:
            mock_client.chat.completions.create.return_value = make_mock_response(llm_output)

            from backend.services.llm_service import analyze_grammar
            result = analyze_grammar("Hello.")

        assert result["overall_score"] == 10
