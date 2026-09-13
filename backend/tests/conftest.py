from unittest.mock import MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.config import get_settings
from app.main import app


@pytest.fixture
def mock_supabase():
    mock_client = MagicMock()

    def create_query_chain():
        q = MagicMock()
        q.eq.return_value = q
        q.in_.return_value = q
        q.order.return_value = q
        q.single.return_value = q
        q.or_.return_value = q
        return q

    mock_table = MagicMock()
    mock_table.select.return_value = create_query_chain()
    mock_table.insert.return_value = create_query_chain()
    mock_table.update.return_value = create_query_chain()
    mock_table.delete.return_value = create_query_chain()

    mock_client.table.return_value = mock_table

    mock_storage = MagicMock()
    mock_client.storage.from_.return_value = mock_storage
    mock_storage.upload.return_value = None
    mock_storage.get_public_url.return_value = "https://example.com/image.png"
    mock_storage.remove.return_value = None

    return mock_client


@pytest.fixture
def mock_settings():
    get_settings.cache_clear()
    with patch.dict(
        "os.environ",
        {
            "SUPABASE_URL": "https://test.supabase.co",
            "SUPABASE_SECRET_KEY": "test-key",
            "FAL_API_KEY": "test-fal-key",
            "GEMINI_API_KEY": "test-gemini-key",
        },
    ):
        yield


@pytest.fixture
async def client(mock_supabase, mock_settings):
    with (
        patch("app.api.routes.wardrobe.get_supabase", return_value=mock_supabase),
        patch("app.api.routes.outfits.get_supabase", return_value=mock_supabase),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            yield ac


@pytest.fixture
def sample_wardrobe_item():
    return {
        "id": "test-item-id",
        "user_id": "test-user-id",
        "name": "Blue Shirt",
        "category": "tops",
        "image_path": "test-user-id/test-item-id.jpg",
        "labels": ["casual", "summer"],
        "colors": ["blue"],
        "seasons": ["summer"],
        "is_inspiration": False,
        "is_template": False,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00",
    }


@pytest.fixture
def sample_outfit():
    return {
        "id": "test-outfit-id",
        "user_id": "test-user-id",
        "name": "Summer Look",
        "item_ids": ["item-1", "item-2"],
        "thumbnail_path": "test-user-id/thumbnails/test.png",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00",
    }
