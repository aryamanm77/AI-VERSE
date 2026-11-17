from app.services.api_key_service import api_key_service
from app.services.auth_service import auth_service


def test_api_key_lifecycle(client):
    # 1. Initialize user
    user = auth_service.get_or_create_user("user_test_123", email="user@example.com")
    assert user["uid"] == "user_test_123"

    # 2. Create API key via service
    key_doc, raw_key = api_key_service.create_api_key("user_test_123", name="My Test Key")
    assert raw_key.startswith("sk_verse_")
    assert key_doc["keyPrefix"] == raw_key[:14]
    assert "keyHash" in key_doc
    assert key_doc["keyHash"] != raw_key  # Must be hashed

    # 3. Validate API key
    validated = api_key_service.validate_api_key(raw_key)
    assert validated is not None
    assert validated["userId"] == "user_test_123"

    # 4. Invalidate wrong key
    assert api_key_service.validate_api_key("sk_verse_invalidkey123") is None

    # 5. Revoke key
    revoked = api_key_service.revoke_api_key("user_test_123", key_doc["keyId"])
    assert revoked is True

    # 6. Validated key should now fail
    assert api_key_service.validate_api_key(raw_key) is None


def test_auth_me_endpoint(client):
    # Pass mock auth token
    headers = {"Authorization": "Bearer mock_token_user_test_456"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["uid"] == "user_test_456"
    assert data["subscriptionPlan"] == "STARTER"
