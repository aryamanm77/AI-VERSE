import os
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_NAME: str = "AI VERSE"
    DEBUG: bool = False
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Firebase
    FIREBASE_PROJECT_ID: str = "ai-verse-default"
    FIREBASE_SERVICE_ACCOUNT_PATH: str = ""
    FIREBASE_SERVICE_ACCOUNT_JSON: str = ""
    FIREBASE_DATABASE_ID: str = "(default)"

    # Secrets
    WORKER_TOKEN_HASH_SECRET: str = "dev_worker_token_secret_replace_in_prod_32chars"
    API_KEY_HASH_SECRET: str = "dev_api_key_secret_replace_in_prod_32chars_min"

    # CORS
    CORS_ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # Worker & Queue timeouts
    REQUEST_TIMEOUT_SECONDS: int = 120
    WORKER_HEARTBEAT_TIMEOUT_SECONDS: int = 45
    JOB_LEASE_SECONDS: int = 60
    MAX_JOB_RETRIES: int = 2

    # Logging
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ALLOWED_ORIGINS.split(",") if o.strip()]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
