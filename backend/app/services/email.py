"""Email service — Resend integration.

Uses httpx (already a project dependency) directly instead of the resend SDK
to keep the dependency footprint minimal.

API reference: https://resend.com/docs/api-reference/emails/send-email

Configuration (env vars, see config.py):
  RESEND_API_KEY  — required to send; if absent, emails are logged and skipped.
  EMAIL_FROM      — "Fungus <noreply@yourdomain.com>"
                    Use "Fungus <onboarding@resend.dev>" during development
                    (Resend allows this for testing; sends only to the account owner).
  FRONTEND_URL    — base URL of the frontend, e.g. https://fungus-ashen.vercel.app
"""
import logging

import httpx

from app.config import settings

log = logging.getLogger(__name__)

_RESEND_API = "https://api.resend.com/emails"


def _verification_html(verify_url: str, first_name: str | None) -> str:
    """Return a minimal, clean HTML email body."""
    greeting = f"Hola {first_name}," if first_name else "Hola,"
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirma tu email — Fungus</title>
</head>
<body style="margin:0;padding:0;background:#30372a;font-family:'DM Sans',Arial,sans-serif;color:#f4ebe1;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#1e2419;border-radius:16px;padding:40px 36px;">
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                🍄 Fungus
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:22px;font-weight:600;">{greeting}</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#d9cda1;">
                Gracias por registrarte en Fungus. Confirma tu dirección de email
                haciendo clic en el botón de abajo. El enlace caduca en
                <strong>24 horas</strong>.
              </p>
              <a href="{verify_url}"
                 style="display:inline-block;background:#8b6f47;color:#fff;
                        text-decoration:none;padding:14px 28px;border-radius:10px;
                        font-size:15px;font-weight:600;">
                Confirmar email
              </a>
              <p style="margin:28px 0 0;font-size:12px;color:#f4ebe1;opacity:0.4;
                        line-height:1.6;">
                Si no creaste esta cuenta puedes ignorar este mensaje.<br/>
                O copia y pega este enlace en tu navegador:<br/>
                <span style="word-break:break-all;">{verify_url}</span>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:12px;color:#f4ebe1;opacity:0.3;">
          © {_current_year()} Fungus · Predicción micológica para Cataluña y España
        </p>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _current_year() -> int:
    from datetime import datetime, UTC
    return datetime.now(UTC).year


async def send_verification_email(
    email: str,
    token: str,
    first_name: str | None = None,
) -> bool:
    """
    Send an email verification message via Resend.

    Returns True on success, False on failure (non-blocking — caller should
    not abort the registration flow if this fails).

    If RESEND_API_KEY is not configured the call is skipped and a warning is
    logged (useful in local development without a real API key).
    """
    if not settings.has_resend:
        log.warning(
            "RESEND_API_KEY not configured — skipping verification email to %s. "
            "Set RESEND_API_KEY in .env to enable sending.",
            email,
        )
        return False

    verify_url = f"{settings.frontend_url.rstrip('/')}/verificar-email?token={token}"

    payload = {
        "from": settings.email_from,
        "to": [email],
        "subject": "Confirma tu email en Fungus 🍄",
        "html": _verification_html(verify_url, first_name),
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                _RESEND_API,
                json=payload,
                headers={
                    "Authorization": f"Bearer {settings.resend_api_key}",
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            log.info("Verification email sent to %s (Resend id=%s)", email, response.json().get("id"))
            return True
    except httpx.HTTPStatusError as exc:
        log.error(
            "Resend API error sending to %s: %s %s",
            email,
            exc.response.status_code,
            exc.response.text,
        )
        return False
    except Exception as exc:  # noqa: BLE001
        log.error("Unexpected error sending verification email to %s: %s", email, exc)
        return False
