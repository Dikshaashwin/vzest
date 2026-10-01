"""Thin wrapper around Shiprocket's REST API. Docs: https://apidocs.shiprocket.in/

TODO: wire up SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD in .env and test against a real account.
"""

import time

import httpx

from app.config import get_settings

settings = get_settings()
BASE_URL = "https://apiv2.shiprocket.in/v1/external"

_cached_token: tuple[str, float] | None = None


def _get_auth_token() -> str:
    global _cached_token
    if _cached_token and _cached_token[1] > time.time():
        return _cached_token[0]

    if not settings.shiprocket_email or not settings.shiprocket_password:
        raise RuntimeError("Shiprocket credentials are not configured.")

    res = httpx.post(
        f"{BASE_URL}/auth/login",
        json={"email": settings.shiprocket_email, "password": settings.shiprocket_password},
        timeout=10,
    )
    res.raise_for_status()
    token = res.json()["token"]
    _cached_token = (token, time.time() + 9 * 24 * 60 * 60)
    return token


def check_serviceability(pincode: str, weight_kg: float) -> dict:
    token = _get_auth_token()
    res = httpx.get(
        f"{BASE_URL}/courier/serviceability",
        params={"delivery_postcode": pincode, "weight": weight_kg, "cod": 0},
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    return res.json()


def create_shipment(order_payload: dict) -> dict:
    token = _get_auth_token()
    res = httpx.post(
        f"{BASE_URL}/orders/create/adhoc",
        json=order_payload,
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    res.raise_for_status()
    return res.json()


def track_shipment(awb_code: str) -> dict:
    token = _get_auth_token()
    res = httpx.get(f"{BASE_URL}/courier/track/awb/{awb_code}", headers={"Authorization": f"Bearer {token}"}, timeout=10)
    return res.json()
