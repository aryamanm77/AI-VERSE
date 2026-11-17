from fastapi import Header, HTTPException, status
from typing import Optional, Dict, Any
from app.services.worker_service import worker_service
from app.utils.logging import setup_logger

logger = setup_logger("worker_auth")


async def get_authenticated_worker(
    x_worker_id: Optional[str] = Header(None, alias="X-Worker-Id"),
    x_worker_token: Optional[str] = Header(None, alias="X-Worker-Token")
) -> Dict[str, Any]:
    """
    Authenticates model worker daemon (Colab / Kaggle / local).
    Validates identity and cryptographic token hash against Firestore.
    """
    if not x_worker_id or not x_worker_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing worker authentication headers (X-Worker-Id, X-Worker-Token)."
        )

    worker = worker_service.authenticate_worker(x_worker_id, x_worker_token)
    if not worker:
        logger.warning(f"Failed worker authentication attempt for ID: {x_worker_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid worker credentials."
        )

    if worker.get("status") == "disabled":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Worker has been disabled by platform administrator."
        )

    return worker
