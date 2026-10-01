import hashlib
import hmac

import httpx

from app.config import get_settings

settings = get_settings()

RAZORPAY_API = "https://api.razorpay.com/v1"


def create_razorpay_order(amount_in_paise: int, receipt: str) -> dict:
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        raise RuntimeError("Razorpay keys are not configured. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET.")

    res = httpx.post(
        f"{RAZORPAY_API}/orders",
        auth=(settings.razorpay_key_id, settings.razorpay_key_secret),
        json={"amount": amount_in_paise, "currency": "INR", "receipt": receipt},
        timeout=10,
    )
    res.raise_for_status()
    return res.json()


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    if not settings.razorpay_key_secret:
        raise RuntimeError("RAZORPAY_KEY_SECRET is not configured.")
    expected = hmac.new(
        settings.razorpay_key_secret.encode(), f"{order_id}|{payment_id}".encode(), hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def verify_webhook_signature(raw_body: bytes, signature: str) -> bool:
    if not settings.razorpay_webhook_secret:
        raise RuntimeError("RAZORPAY_WEBHOOK_SECRET is not configured.")
    expected = hmac.new(settings.razorpay_webhook_secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
