import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.firebase_service import firebase_service
from app.services.key_bank_service import key_bank_service, KeyRecord

client = TestClient(app)

MOCK_KEYS = [f"mock_admin_key_{i}_{'a'*20}" for i in range(11)]


@pytest.fixture(autouse=True)
def ensure_bank_keys():
    """Ensures test keys are present in KeyBank for admin tests."""
    if not key_bank_service.has_active_keys():
        for i, k in enumerate(MOCK_KEYS):
            key_bank_service._keys.append(KeyRecord(f"kb_{i}", k, "groq"))
    yield
    key_bank_service._keys.clear()


@pytest.fixture
def admin_header():
    user = {
        "uid": "admin_tester",
        "email": "admin@ai-verse.com",
        "displayName": "Admin Tester",
        "role": "admin",
        "accountStatus": "active"
    }
    firebase_service.set_document("users", "admin_tester", user)
    return {"Authorization": "Bearer mock_token_admin_tester"}


def test_admin_get_key_bank_status(admin_header):
    res = client.get("/api/admin/key-bank", headers=admin_header)
    assert res.status_code == 200
    data = res.json()
    assert "total_keys" in data
    assert "active_keys" in data
    assert "keys" in data
    assert data["total_keys"] >= 11
    assert len(data["keys"]) >= 11
    assert "masked_key" in data["keys"][0]
    assert "status" in data["keys"][0]


def test_admin_add_key_to_bank(admin_header):
    new_key = "gsk_dynamic_test_99999999999999999999999"
    payload = {"key": new_key, "provider": "groq"}
    res = client.post("/api/admin/key-bank", json=payload, headers=admin_header)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "added"
    assert "key_id" in data
    assert data["masked_key"].startswith("gsk_dyn")

    # Verify it appears in key bank status
    status_res = client.get("/api/admin/key-bank", headers=admin_header)
    status_data = status_res.json()
    matching = [k for k in status_data["keys"] if k["key_id"] == data["key_id"]]
    assert len(matching) == 1
    assert matching[0]["status"] == "active"
