from fastapi import Request
from fastapi.responses import JSONResponse
from app.utils.logging import setup_logger

logger = setup_logger("error_handler")


async def global_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", "unknown")
    logger.error(f"Unhandled exception [Request: {req_id}]: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "message": "Internal server error occurred.",
                "type": "internal_server_error",
                "code": "internal_error",
                "request_id": req_id
            }
        }
    )
