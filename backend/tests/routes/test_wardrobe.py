from unittest.mock import MagicMock

import pytest


class TestGetWardrobeItems:
    @pytest.mark.asyncio
    async def test_get_items_success(self, client, mock_supabase, sample_wardrobe_item):
        mock_result = MagicMock()
        mock_result.data = [sample_wardrobe_item]

        mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_result

        response = await client.get("/api/wardrobe/items?user_id=test-user-id")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Blue Shirt"
        assert data[0]["category"] == "tops"

    @pytest.mark.asyncio
    async def test_get_items_with_category_filter(
        self, client, mock_supabase, sample_wardrobe_item
    ):
        mock_result = MagicMock()
        mock_result.data = [sample_wardrobe_item]

        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.order.return_value.execute.return_value = mock_result

        response = await client.get(
            "/api/wardrobe/items?user_id=test-user-id&category=tops"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    @pytest.mark.asyncio
    async def test_get_items_empty_list(self, client, mock_supabase):
        mock_result = MagicMock()
        mock_result.data = []

        mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_result

        response = await client.get("/api/wardrobe/items?user_id=test-user-id")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0


class TestGetWardrobeItem:
    @pytest.mark.asyncio
    async def test_get_single_item_success(
        self, client, mock_supabase, sample_wardrobe_item
    ):
        mock_result = MagicMock()
        mock_result.data = sample_wardrobe_item

        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value = mock_result

        response = await client.get(
            f"/api/wardrobe/items/{sample_wardrobe_item['id']}?user_id=test-user-id"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_wardrobe_item["id"]
        assert data["name"] == sample_wardrobe_item["name"]

    @pytest.mark.asyncio
    async def test_get_single_item_not_found(self, client, mock_supabase):
        mock_result = MagicMock()
        mock_result.data = None

        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value = mock_result

        response = await client.get(
            "/api/wardrobe/items/nonexistent-id?user_id=test-user-id"
        )

        assert response.status_code == 404


class TestCreateWardrobeItem:
    @pytest.mark.asyncio
    async def test_create_item_missing_required_fields(self, client, mock_supabase):
        response = await client.post("/api/wardrobe/items", data={})

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_item_missing_image(self, client, mock_supabase):
        response = await client.post(
            "/api/wardrobe/items",
            data={"user_id": "test-user-id", "name": "Test Item", "category": "tops"},
        )

        assert response.status_code == 400
        assert "image_path or image file is required" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_create_item_with_image_path(self, client, mock_supabase):
        mock_result = MagicMock()
        mock_result.data = [
            {
                "id": "new-item-id",
                "user_id": "test-user-id",
                "name": "New Shirt",
                "category": "tops",
                "image_path": "existing/path.jpg",
                "labels": [],
                "colors": [],
                "seasons": [],
                "is_inspiration": False,
                "is_template": False,
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00",
            }
        ]

        mock_supabase.table.return_value.insert.return_value.execute.return_value = (
            mock_result
        )

        response = await client.post(
            "/api/wardrobe/items",
            data={
                "user_id": "test-user-id",
                "name": "New Shirt",
                "category": "tops",
                "image_path": "existing/path.jpg",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "New Shirt"
        assert data["category"] == "tops"


class TestUpdateWardrobeItem:
    @pytest.mark.asyncio
    async def test_update_item_success(
        self, client, mock_supabase, sample_wardrobe_item
    ):
        updated_item = sample_wardrobe_item.copy()
        updated_item["name"] = "Updated Name"

        mock_result = MagicMock()
        mock_result.data = [updated_item]

        mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_result

        response = await client.put(
            f"/api/wardrobe/items/{sample_wardrobe_item['id']}?user_id=test-user-id",
            json={"name": "Updated Name"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"

    @pytest.mark.asyncio
    async def test_update_item_not_found(self, client, mock_supabase):
        mock_result = MagicMock()
        mock_result.data = []

        mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_result

        response = await client.put(
            "/api/wardrobe/items/nonexistent-id?user_id=test-user-id",
            json={"name": "Updated Name"},
        )

        assert response.status_code == 404


class TestDeleteWardrobeItem:
    @pytest.mark.asyncio
    async def test_delete_item_success(
        self, client, mock_supabase, sample_wardrobe_item
    ):
        mock_select_result = MagicMock()
        mock_select_result.data = {"image_path": "test/path.jpg"}

        mock_delete_result = MagicMock()
        mock_delete_result.data = [{"id": sample_wardrobe_item["id"]}]

        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value = mock_select_result
        mock_supabase.table.return_value.delete.return_value.eq.return_value.eq.return_value.execute.return_value = mock_delete_result

        response = await client.delete(
            f"/api/wardrobe/items/{sample_wardrobe_item['id']}?user_id=test-user-id"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_delete_item_not_found(self, client, mock_supabase):
        mock_result = MagicMock()
        mock_result.data = None

        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value = mock_result

        response = await client.delete(
            "/api/wardrobe/items/nonexistent-id?user_id=test-user-id"
        )

        assert response.status_code == 404
