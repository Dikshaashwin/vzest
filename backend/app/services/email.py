import httpx

from app.config import get_settings

settings = get_settings()

RESEND_API = "https://api.resend.com/emails"


def _send(to: str, subject: str, html: str) -> None:
    if not settings.resend_api_key:
        raise RuntimeError("RESEND_API_KEY is not configured.")
    httpx.post(
        RESEND_API,
        headers={"Authorization": f"Bearer {settings.resend_api_key}"},
        json={"from": settings.resend_from_email, "to": to, "subject": subject, "html": html},
        timeout=10,
    ).raise_for_status()


def send_order_confirmation_email(to: str, order_number: str, total: str) -> None:
    _send(
        to,
        f"Order confirmed — {order_number}",
        f"<p>Thank you for your order!</p><p>Order <strong>{order_number}</strong> for "
        f"<strong>{total}</strong> has been confirmed.</p>",
    )


def send_order_status_email(to: str, order_number: str, status: str) -> None:
    _send(
        to,
        f"Order {order_number} update: {status}",
        f"<p>Your order <strong>{order_number}</strong> status is now <strong>{status}</strong>.</p>",
    )
