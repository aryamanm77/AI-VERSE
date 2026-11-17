import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        req_id = request.headers.get("X-Request-Id") or f"req_{uuid.uuid4().hex[:16]}"
        request.state.request_id = req_id
        response: Response = await call_next(request)
        response.headers["X-Request-Id"] = req_id
        return response
