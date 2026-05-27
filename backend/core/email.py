import urllib.request
import urllib.error
import json
import logging

from .config import settings

logger = logging.getLogger(__name__)


def send_verification_email(to_email: str, token: str) -> bool:
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured — skipping verification email")
        return False

    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2>Verify your email address</h2>
      <p>Click the button below to activate your account. The link expires in 24 hours.</p>
      <a href="{verify_url}"
         style="display:inline-block;padding:12px 24px;background:#1a4a8a;color:#fff;text-decoration:none;border-radius:6px">
        Verify Email
      </a>
      <p style="margin-top:20px;color:#666;font-size:13px">
        If you didn't create an account, you can ignore this email.
      </p>
    </div>
    """

    payload = json.dumps({
        "from": settings.RESEND_FROM_EMAIL,
        "to": [to_email],
        "subject": "Verify your email address",
        "html": html,
    }).encode()

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status in (200, 201)
    except Exception as exc:
        logger.error("Failed to send verification email to %s: %s", to_email, exc)
        return False
