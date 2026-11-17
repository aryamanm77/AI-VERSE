from datetime import datetime, timezone


def utc_now() -> datetime:
    """Returns current datetime in UTC timezone."""
    return datetime.now(timezone.utc)


def utc_iso_now() -> str:
    """Returns ISO 8601 formatted string of current UTC datetime."""
    return utc_now().isoformat()


def to_iso(dt: datetime | None) -> str | None:
    """Convert datetime to ISO 8601 string safely."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()
