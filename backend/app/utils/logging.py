import logging
import sys
from app.config import get_settings


def setup_logger(name: str = "ai_verse") -> logging.Logger:
    settings = get_settings()
    logger = logging.getLogger(name)
    logger.setLevel(settings.LOG_LEVEL.upper())

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            fmt="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
