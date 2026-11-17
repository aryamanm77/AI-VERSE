from typing import List, Dict, Any, Optional
from app.services.firebase_service import firebase_service
from app.utils.logging import setup_logger

logger = setup_logger("model_service")

DEFAULT_MODELS: Dict[str, Dict[str, Any]] = {
    "cyrus": {
        "id": "cyrus",
        "object": "model",
        "created": 1710000000,
        "owned_by": "ai-verse",
        "display_name": "CYRUS",
        "description": "General-purpose intelligence for text generation, summarization, conversation, and general coding assistance.",
        "category": "General Intelligence",
        "enabled": True,
        "context_window": 8192,
        "allowed_tiers": ["STARTER", "BASIC", "PRO", "ULTRA"],
        "worker_type": "Google Colab / Kaggle"
    },
    "cyran": {
        "id": "cyran",
        "object": "model",
        "created": 1710000000,
        "owned_by": "ai-verse",
        "display_name": "CYRAN",
        "description": "Advanced intelligence for complex reasoning, technical problem-solving, and deep code analysis.",
        "category": "Advanced Reasoning",
        "enabled": True,
        "context_window": 16384,
        "allowed_tiers": ["PRO", "ULTRA"],
        "worker_type": "Kaggle / Google Colab"
    }
}


class ModelService:
    def list_models(self) -> List[Dict[str, Any]]:
        # Fetch enabled models from Firestore or defaults
        db_models = firebase_service.query_collection("models", filters=[("enabled", "==", True)])
        if db_models:
            # Format to OpenAI spec
            result = []
            for m in db_models:
                m_id = m.get("modelId", "").lower()
                def_m = DEFAULT_MODELS.get(m_id, {})
                result.append({
                    "id": m_id,
                    "object": "model",
                    "created": 1710000000,
                    "owned_by": "ai-verse",
                    "display_name": m.get("displayName", def_m.get("display_name", m_id.upper())),
                    "description": m.get("description", def_m.get("description", "")),
                    "category": m.get("category", def_m.get("category", "Intelligence")),
                    "enabled": m.get("enabled", True),
                    "context_window": def_m.get("context_window", 8192),
                    "allowed_tiers": def_m.get("allowed_tiers", ["PRO", "ULTRA"])
                })
            return result
        return list(DEFAULT_MODELS.values())

    def get_model(self, model_id: str) -> Optional[Dict[str, Any]]:
        clean_id = model_id.lower()
        if clean_id not in DEFAULT_MODELS:
            return None
        doc = firebase_service.get_document("models", clean_id)
        if doc and not doc.get("enabled", True):
            return None
        return DEFAULT_MODELS[clean_id]


model_service = ModelService()
