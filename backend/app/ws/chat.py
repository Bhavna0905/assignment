import html
import re
from datetime import datetime, timezone
from typing import Optional, Tuple
from uuid import uuid4

MAX_MESSAGE_LENGTH = 2000

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(tzinfo=None).isoformat() + "Z"


def sanitize_message(text: str) -> str:
    if not isinstance(text, str):
        return ""
    cleaned = _CONTROL_CHARS.sub("", text).strip()
    if not cleaned:
        return ""
    return html.escape(cleaned)[:MAX_MESSAGE_LENGTH]


def validate_message(text: object) -> Tuple[bool, Optional[str], Optional[str]]:
    if not isinstance(text, str):
        return False, None, "Message must be a string"
    sanitized = sanitize_message(text)
    if not sanitized:
        return False, None, "Message cannot be empty"
    if len(sanitized) > MAX_MESSAGE_LENGTH:
        return False, None, f"Message exceeds {MAX_MESSAGE_LENGTH} characters"
    return True, sanitized, None


def new_message_id() -> str:
    return str(uuid4())
