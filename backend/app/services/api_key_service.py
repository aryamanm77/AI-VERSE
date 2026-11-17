import uuid
from typing import Optional, Dict, Any, List, Tuple
from app.config import get_settings
from app.services.firebase_service import firebase_service
from app.utils.crypto import generate_api_key, hash_api_key, verify_hash
from app.utils.datetime_utils import utc_iso_now
from app.utils.logging import setup_logger

logger = setup_logger("api_key_service")


class ApiKeyService:
    def __init__(self):
        self.settings = get_settings()

    def create_api_key(self, user_id: str, name: str = "Default Key") -> Tuple[Dict[str, Any], str]:
        """
        Creates an API key for a user.
        Returns:
            (key_record, plaintext_key)
        """
        full_key, prefix, _ = generate_api_key()
        key_hash = hash_api_key(full_key, self.settings.API_KEY_HASH_SECRET)
        key_id = f"key_{uuid.uuid4().hex[:16]}"
        now = utc_iso_now()

        key_record = {
            "keyId": key_id,
            "userId": user_id,
            "name": name,
            "keyPrefix": prefix,
            "keyHash": key_hash,
            "status": "active",  # active, revoked
            "createdAt": now,
            "lastUsedAt": None,
            "revokedAt": None
        }

        firebase_service.set_document("api_keys", key_id, key_record)
        logger.info(f"Created API key {key_id} (prefix: {prefix}) for user {user_id}")
        return key_record, full_key

    def validate_api_key(self, plaintext_key: str) -> Optional[Dict[str, Any]]:
        """
        Validates a plaintext API key by matching prefix and verifying HMAC hash.
        Returns the key document with user info if valid, None otherwise.
        """
        if not plaintext_key or not (plaintext_key.startswith("sk_verse_") or plaintext_key.startswith("sk-verse-")):
            return None

        prefix = plaintext_key[:14]
        # Query keys matching prefix
        keys = firebase_service.query_collection("api_keys", filters=[("keyPrefix", "==", prefix)])
        for k in keys:
            if k.get("status") == "active":
                stored_hash = k.get("keyHash", "")
                if verify_hash(plaintext_key, stored_hash, self.settings.API_KEY_HASH_SECRET, is_worker=False):
                    # Key is valid, update lastUsedAt
                    firebase_service.update_document("api_keys", k["keyId"], {
                        "lastUsedAt": utc_iso_now()
                    })
                    return k
        return None

    def revoke_api_key(self, user_id: str, key_id: str) -> bool:
        """Revokes an API key belonging to user."""
        key_doc = firebase_service.get_document("api_keys", key_id)
        if not key_doc or key_doc.get("userId") != user_id:
            return False
        return firebase_service.update_document("api_keys", key_id, {
            "status": "revoked",
            "revokedAt": utc_iso_now()
        })

    def list_user_api_keys(self, user_id: str) -> List[Dict[str, Any]]:
        """Returns metadata for all API keys belonging to the user (without raw hashes)."""
        keys = firebase_service.query_collection(
            "api_keys",
            filters=[("userId", "==", user_id)],
            order_by="createdAt",
            descending=True
        )
        safe_keys = []
        for k in keys:
            safe_keys.append({
                "keyId": k.get("keyId"),
                "name": k.get("name"),
                "keyPrefix": k.get("keyPrefix"),
                "status": k.get("status"),
                "createdAt": k.get("createdAt"),
                "lastUsedAt": k.get("lastUsedAt"),
                "revokedAt": k.get("revokedAt")
            })
        return safe_keys


api_key_service = ApiKeyService()
