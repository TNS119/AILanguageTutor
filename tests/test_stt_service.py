import os
import pytest
from unittest.mock import MagicMock, patch


class TestTranscribeAudio:

    def test_transcription_returns_text(self, tmp_path):
        audio_file = tmp_path / "test.webm"
        audio_file.write_bytes(b"fake audio content")

        mock_transcription = MagicMock()
        mock_transcription.text = "She go to school yesterday"

        with patch("backend.services.stt_service.client") as mock_client:
            mock_client.audio.transcriptions.create.return_value = mock_transcription

            from backend.services.stt_service import transcribe_audio
            result = transcribe_audio(str(audio_file))

        assert result["text"] == "She go to school yesterday"
        assert result["language"] == "en"

    def test_empty_transcription_raises_value_error(self, tmp_path):
        audio_file = tmp_path / "test.webm"
        audio_file.write_bytes(b"fake audio content")

        mock_transcription = MagicMock()
        mock_transcription.text = ""

        with patch("backend.services.stt_service.client") as mock_client:
            mock_client.audio.transcriptions.create.return_value = mock_transcription

            from backend.services.stt_service import transcribe_audio

            with pytest.raises(ValueError, match="No speech was detected"):
                transcribe_audio(str(audio_file))

    def test_missing_file_raises_error(self):
        with patch("backend.services.stt_service.client"):
            from backend.services.stt_service import transcribe_audio

            with pytest.raises(FileNotFoundError):
                transcribe_audio("/nonexistent/path/audio.webm")
