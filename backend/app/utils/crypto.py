import hmac
import hashlib
import secrets
from typing import Tuple


def generate_api_key() -> Tuple[str, str, str]:
    """
    Generates a secure API key.
    Format: sk_verse_<32_random_bytes_hex>
    Returns:
        (full_key, key_prefix, key_secret_component)
    """
    random_part = secrets.token_hex(24)
    full_key = f"sk_verse_{random_part}"
    prefix = full_key[:14]  # e.g. "sk_verse_ab12"
    return full_key, prefix, random_part


def hash_api_key(api_key: str, secret: str) -> str:
    """
    Computes HMAC-SHA256 of the API key using backend secret.
    """
    return hmac.new(
        secret.encode("utf-8"),
        api_key.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()


def generate_worker_token() -> str:
    """
    Generates a cryptographically secure worker authentication token.
    Format: wtk_verse_<32_random_bytes_hex>
    """
    return f"wtk_verse_{secrets.token_hex(24)}"


def hash_worker_token(token: str, secret: str) -> str:
    """
    Computes HMAC-SHA256 of the worker token using backend secret.
    """
    return hmac.new(
        secret.encode("utf-8"),
        token.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()


def verify_hash(received_plaintext: str, stored_hash: str, secret: str, is_worker: bool = False) -> bool:
    """
    Constant-time comparison of plaintext against stored hash.
    """
    if is_worker:
        computed = hash_worker_token(received_plaintext, secret)
    else:
        computed = hash_api_key(received_plaintext, secret)
    return hmac.compare_digest(computed, stored_hash)
