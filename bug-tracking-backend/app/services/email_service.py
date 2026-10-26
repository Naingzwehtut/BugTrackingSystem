"""
app/services/email_service.py
-------------------------------
Sends email through any SMTP server, in a background thread so the API
request that triggered it (e.g. "Assign developer") isn't slowed down.

Without SMTP_HOST configured, emails are logged instead of sent, so local
development and the test suite need no email account.

Tests (or anything else) can capture emails by setting
app.config["EMAIL_SENDER"] to a function(to, subject, text, html).
"""

import logging
import smtplib
import ssl
import threading
from email.message import EmailMessage
from html import escape

from flask import current_app

logger = logging.getLogger(__name__)


def _smtp_send(config, to, subject, text, html):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = config["EMAIL_FROM"] or config["SMTP_USER"]
    msg["To"] = to
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    context = ssl.create_default_context()
    if config["SMTP_USE_SSL"]:
        with smtplib.SMTP_SSL(config["SMTP_HOST"], config["SMTP_PORT"], context=context, timeout=15) as smtp:
            if config["SMTP_USER"]:
                smtp.login(config["SMTP_USER"], config["SMTP_PASSWORD"])
            smtp.send_message(msg)
    else:
        with smtplib.SMTP(config["SMTP_HOST"], config["SMTP_PORT"], timeout=15) as smtp:
            smtp.starttls(context=context)
            if config["SMTP_USER"]:
                smtp.login(config["SMTP_USER"], config["SMTP_PASSWORD"])
            smtp.send_message(msg)


def render_email(heading, body, link_path=None, link_label="Open in Bug Tracker"):
    """Plain-text and HTML versions of a simple notification email."""
    url = f"{current_app.config['APP_URL']}{link_path}" if link_path else None
    text = f"{heading}\n\n{body}\n" + (f"\n{link_label}: {url}\n" if url else "")
    button = (
        f'<p style="margin:24px 0"><a href="{escape(url)}" style="background:#2563eb;color:#fff;'
        f'padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">{escape(link_label)}</a></p>'
        if url
        else ""
    )
    html = (
        '<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#111827">'
        '<p style="color:#2563eb;font-weight:700;margin:0 0 16px">BugTrack</p>'
        f'<h2 style="font-size:18px;margin:0 0 12px">{escape(heading)}</h2>'
        f'<p style="line-height:1.5;color:#374151;white-space:pre-line">{escape(body)}</p>'
        f"{button}"
        '<p style="font-size:12px;color:#9ca3af">You can turn off these emails in Settings.</p>'
        "</div>"
    )
    return text, html


def send_email(to, subject, text, html):
    """Queue one email. Never raises: email is best-effort."""
    if not to:
        return
    config = current_app.config
    custom_sender = config.get("EMAIL_SENDER")
    if custom_sender:
        custom_sender(to, subject, text, html)
        return
    if not config.get("SMTP_HOST"):
        logger.info("Email (SMTP not configured, not sent) to=%s subject=%s\n%s", to, subject, text)
        return

    settings = {key: config.get(key) for key in (
        "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_USE_SSL", "EMAIL_FROM"
    )}

    def worker():
        try:
            _smtp_send(settings, to, subject, text, html)
        except Exception:  # noqa: BLE001 - log and move on; email must not break the app
            logger.exception("Failed to send email to %s", to)

    threading.Thread(target=worker, daemon=True).start()
