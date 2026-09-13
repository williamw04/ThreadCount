from unittest.mock import MagicMock

import pytest


class TestGetOutfits:
    @pytest.mark.asyncio
    async def test_get_outfits_success(self, client, mock_supabase, sample_outfit):
        mock_result = MagicMock()
        mock_result.data = [sample_outfit]

        mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_result

        response = await client.get("/api/outfits?user_id=test-user-id")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Summer Look"

    @pytest.mark.asyncio
    async def test_get_outfits_empty_list(self, client, mock_supabase):
        mock_result = MagicMock()
        mock_result.data = []

        mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_result

        response = await client.get("/api/outfits?user_id=test-user-id")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0


class TestGetOutfit:
    @pytest.mark.asyncio
    async def test_get_single_outfit_success(
        self, client, mock_supabase, sample_outfit
    ):
        mock_result = MagicMock()
        mock_result.data = sample_outfit

        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value = mock_result

        response = await client.get(
            f"/api/outfits/{sample_outfit['id']}?user_id=test-user-id"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_outfit["id"]
        assert data["name"] == sample_outfit["name"]

    @pytest.mark.asyncio
    async def test_get_single_outfit_not_found(self, client, mock_supabase):
        mock_result = MagicMock()
        mock_result.data = None

        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value = mock_result

        response = await client.get("/api/outfits/nonexistent-id?user_id=test-user-id")

        assert response.status_code == 404


class TestCreateOutfit:
    @pytest.mark.asyncio
    async def test_create_outfit_success(self, client, mock_supabase):
        mock_result = MagicMock()
        mock_result.data = [
            {
                "id": "new-outfit-id",
                "user_id": "test-user-id",
                "name": "New Outfit",
                "item_ids": ["item-1", "item-2"],
                "thumbnail_path": None,
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00",
            }
        ]

        mock_supabase.table.return_value.insert.return_value.execute.return_value = (
            mock_result
        )

        response = await client.post(
            "/api/outfits",
            data={
                "user_id": "test-user-id",
                "name": "New Outfit",
                "item_ids": "item-1,item-2",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "New Outfit"
        assert data["item_ids"] == ["item-1", "item-2"]

    @pytest.mark.asyncio
    async def test_create_outfit_missing_user_id(self, client, mock_supabase):
        response = await client.post("/api/outfits", data={"name": "Test Outfit"})

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_outfit_empty_item_ids(self, client, mock_supabase):
        mock_result = MagicMock()
        mock_result.data = [
            {
                "id": "new-outfit-id",
                "user_id": "test-user-id",
                "name": "Empty Outfit",
                "item_ids": [],
                "thumbnail_path": None,
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00",
            }
        ]

        mock_supabase.table.return_value.insert.return_value.execute.return_value = (
            mock_result
        )

        response = await client.post(
            "/api/outfits", data={"user_id": "test-user-id", "name": "Empty Outfit"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["item_ids"] == []


class TestUpdateOutfit:
    @pytest.mark.asyncio
    async def test_update_outfit_success(self, client, mock_supabase, sample_outfit):
        updated_outfit = sample_outfit.copy()
        updated_outfit["name"] = "Updated Look"

        mock_result = MagicMock()
        mock_result.data = [updated_outfit]

        mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_result

        response = await client.put(
            f"/api/outfits/{sample_outfit['id']}?user_id=test-user-id",
            json={"name": "Updated Look"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Look"

    @pytest.mark.asyncio
    async def test_update_outfit_not_found(self, client, mock_supabase):
        mock_result = MagicMock()
        mock_result.data = []

        mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_result

        response = await client.put(
            "/api/outfits/nonexistent-id?user_id=test-user-id",
            json={"name": "Updated Name"},
        )

        assert response.status_code == 404


class TestDeleteOutfit:
    @pytest.mark.asyncio
    async def test_delete_outfit_success(self, client, mock_supabase, sample_outfit):
        mock_result = MagicMock()
        mock_result.data = [sample_outfit]

        mock_supabase.table.return_value.delete.return_value.eq.return_value.eq.return_value.execute.return_value = mock_result

        response = await client.delete(
            f"/api/outfits/{sample_outfit['id']}?user_id=test-user-id"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_delete_outfit_not_found(self, client, mock_supabase):
        mock_result = MagicMock()
        mock_result.data = []

        mock_supabase.table.return_value.delete.return_value.eq.return_value.eq.return_value.execute.return_value = mock_result

        response = await client.delete(
            "/api/outfits/nonexistent-id?user_id=test-user-id"
        )

        assert response.status_code == 404
