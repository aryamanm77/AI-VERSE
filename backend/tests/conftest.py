import os
import pytest
from fastapi.testclient import TestClient

# Set testing environment variables
os.environ["APP_ENV"] = "testing"
os.environ["FIREBASE_PROJECT_ID"] = "ai-verse-test"
os.environ["WORKER_TOKEN_HASH_SECRET"] = "test_worker_hash_secret_32_characters_minimum"
os.environ["API_KEY_HASH_SECRET"] = "test_api_key_hash_secret_32_characters_minimum"
os.environ["REQUEST_TIMEOUT_SECONDS"] = "5"
os.environ["WORKER_HEARTBEAT_TIMEOUT_SECONDS"] = "3"
os.environ["JOB_LEASE_SECONDS"] = "5"

from app.main import app
from app.services.firebase_service import firebase_service


@pytest.fixture(autouse=True)
def reset_mock_db():
    """Resets mock database state between tests."""
    firebase_service._is_mock = True
    firebase_service._mock_data = {
        "users": {},
        "subscriptions": {},
        "api_keys": {},
        "models": {
            "cyrus": {
                "modelId": "cyrus",
                "displayName": "CYRUS",
                "description": "General-purpose intelligence",
                "enabled": True,
                "publicAccess": True
            },
            "cyran": {
                "modelId": "cyran",
                "displayName": "CYRAN",
                "description": "Advanced reasoning intelligence",
                "enabled": True,
                "publicAccess": True
            }
        },
        "workers": {},
        "request_jobs": {},
        "request_logs": {},
        "worker_events": {},
        "usage_records": {},
        "system_settings": {}
    }


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
