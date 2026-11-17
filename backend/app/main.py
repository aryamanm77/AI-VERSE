import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.errors import ServerErrorMiddleware

from app.config import get_settings
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.error_handler import global_exception_handler
from app.utils.logging import setup_logger

# Import routers
from app.routes import (
    health,
    auth,
    users,
    subscriptions,
    api_keys,
    models,
    chat,
    workers,
    admin,
    usage
)

logger = setup_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info(f"Starting {settings.APP_NAME} Backend in {settings.APP_ENV} mode...")
    yield
    logger.info(f"Shutting down {settings.APP_NAME} Backend.")


settings = get_settings()

app = FastAPI(
    title="AI VERSE API Platform",
    description="Production-grade AI API Platform with Multi-Model Worker Orchestration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Middleware setup
app.add_middleware(RequestIdMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-Id"]
)

# Exception handlers
app.add_exception_handler(Exception, global_exception_handler)

# Include routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(subscriptions.router)
app.include_router(api_keys.router)
app.include_router(models.router)
app.include_router(chat.router)
app.include_router(workers.router)
app.include_router(admin.router)
app.include_router(usage.router)


@app.get("/")
async def root():
    return {
        "platform": "AI VERSE",
        "tagline": "One Universe. Infinite Intelligence.",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
