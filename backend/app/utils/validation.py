import re

ALLOWED_MODELS = {"cyrus", "cyran"}
MODEL_FAMILY_MAP = {
    "cyrus": "CYRUS",
    "cyran": "CYRAN",
    "CYRUS": "CYRUS",
    "CYRAN": "CYRAN",
}


def normalize_model_id(model_id: str) -> str:
    """Normalize model identifier (e.g. 'CYRUS' or 'cyrus' -> 'cyrus')."""
    cleaned = (model_id or "").strip().lower()
    if cleaned not in ALLOWED_MODELS:
        raise ValueError(f"Invalid model '{model_id}'. Allowed public models: {list(ALLOWED_MODELS)}")
    return cleaned


def is_valid_worker_id(worker_id: str) -> bool:
    """Validate worker ID: alphanumeric plus hyphens, 3-64 chars."""
    if not worker_id:
        return False
    return bool(re.match(r"^[a-zA-Z0-9_-]{3,64}$", worker_id))
