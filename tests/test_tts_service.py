import os
import pytest
from unittest.mock import AsyncMock, MagicMock, patch


class TestGenerateSpeech:

    @pytest.mark.asyncio
    async def test_empty_text_raises_value_error(self, tmp_path):
        from backend.services.tts_service import generate_speech

        with pytest.raises(ValueError, match="empty"):
            await generate_speech("", str(tmp_path / "output.mp3"))

    @pytest.mark.asyncio
    async def test_generates_audio_file(self, tmp_path):
        output_path = str(tmp_path / "output.mp3")

        mock_communicate = MagicMock()
        async def fake_save(path):
            with open(path, "wb") as f:
                f.write(b"fake mp3 content")
        mock_communicate.save = fake_save

        with patch("backend.services.tts_service.edge_tts.Communicate", return_value=mock_communicate):
            from backend.services.tts_service import generate_speech
            result = await generate_speech("She went to school yesterday.", output_path)

        assert os.path.exists(output_path)
        assert os.path.getsize(output_path) > 0
        assert result == output_path
