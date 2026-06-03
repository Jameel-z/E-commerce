import json
import urllib.error
import urllib.parse
import urllib.request

from core.config import settings


def verify_recaptcha(token: str, min_score: float = 0.5) -> bool:
    """Verify a reCAPTCHA v3 token with Google.

    Returns True if the request looks human (score >= min_score) or if
    reCAPTCHA is disabled / not configured. Fails open on network errors
    to avoid blocking legitimate users.
    """
    if not settings.RECAPTCHA_ENABLED or not settings.RECAPTCHA_SECRET_KEY:
        return True
    if not token:
        return False

    try:
        data = urllib.parse.urlencode(
            {"secret": settings.RECAPTCHA_SECRET_KEY, "response": token}
        ).encode()
        req = urllib.request.Request(
            "https://www.google.com/recaptcha/api/siteverify",
            data=data,
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode())
        return bool(result.get("success")) and float(result.get("score", 0)) >= min_score
    except Exception:
        return True
