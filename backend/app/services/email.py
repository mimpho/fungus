"""Email service — Resend integration.

Uses httpx (already a project dependency) directly instead of the resend SDK
to keep the dependency footprint minimal.

API reference: https://resend.com/docs/api-reference/emails/send-email

Configuration (env vars, see config.py):
  RESEND_API_KEY     — required to send; if absent, emails are logged and skipped.
  EMAIL_FROM         — "Fungus <noreply@yourdomain.com>"
                       Use "Fungus <onboarding@resend.dev>" during development.
  FRONTEND_URL       — base URL of the frontend (verification link destination).
  EMAIL_ASSETS_URL   — base URL for static assets in emails; must be a public URL.
                       Defaults to https://fungus-ashen.vercel.app so dev emails
                       display the logo correctly (Gmail blocks localhost & data URIs).
"""
import logging
from datetime import UTC, datetime

import httpx

from app.config import settings

log = logging.getLogger(__name__)

_RESEND_API = "https://api.resend.com/emails"


def _verification_html(verify_url: str, first_name: str | None) -> str:
    """Return a minimal, clean HTML email body."""
    greeting = f"Hola {first_name}," if first_name else "Hola,"
    logo_url = f"{settings.email_assets_url.rstrip('/')}/static/logoFungusPortrait.png"
    year = _current_year()
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirma tu email — Fungus</title>
</head>
<body style="margin:0;padding:0;background:#30372a;
             font-family:'DM Sans',Arial,sans-serif;color:#f4ebe1;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#1e2419;border-radius:16px;padding:44px 40px;
                      max-width:480px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="{logo_url}" alt="Fungus"
                   width="163" height="163"
                   style="display:block;border-radius:12px;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td align="center">
              <p style="margin:0 0 10px;font-size:22px;font-weight:700;
                        text-align:center;">{greeting}</p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.7;
                        color:#d9cda1;text-align:center;">
                Gracias por registrarte en Fungus. Confirma tu dirección de email
                haciendo clic en el botón de abajo. El enlace caduca en
                <strong style="color:#f4ebe1;">24 horas</strong>.
              </p>
              <a href="{verify_url}"
                 style="display:inline-block;background:#8b6f47;color:#ffffff;
                        text-decoration:none;padding:15px 36px;border-radius:10px;
                        font-size:15px;font-weight:600;letter-spacing:0.2px;">
                Confirmar email
              </a>
              <p style="margin:32px 0 0;font-size:12px;color:#d9cda1;opacity:0.55;
                        line-height:1.7;text-align:center;">
                Si no creaste esta cuenta puedes ignorar este mensaje.<br/>
                O copia y pega este enlace en tu navegador:<br/>
                <a href="{verify_url}"
                   style="color:#93c5fd;word-break:break-all;
                          text-decoration:underline;">{verify_url}</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <p style="margin:20px 0 0;font-size:12px;color:#f4ebe1;opacity:0.3;
                  text-align:center;">
          © {year} Fungus · Predicción micológica para Cataluña y España
        </p>

      </td>
    </tr>
  </table>
</body>
</html>"""


def _current_year() -> int:
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
            log.info(
                "Verification email sent to %s (Resend id=%s)", email, response.json().get("id")
            )
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
