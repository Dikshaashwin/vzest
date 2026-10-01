// Thin wrapper around Shiprocket's REST API.
// Docs: https://apidocs.shiprocket.in/
// TODO: wire up SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD in .env and test against a real account.

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAuthToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) {
    throw new Error("Shiprocket credentials are not configured.");
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Shiprocket authentication failed.");

  const data = (await res.json()) as { token: string };
  cachedToken = { token: data.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };
  return data.token;
}

export async function checkServiceability(pincode: string, weightKg: number) {
  const token = await getAuthToken();
  const res = await fetch(
    `${BASE_URL}/courier/serviceability?delivery_postcode=${pincode}&weight=${weightKg}&cod=0`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.json();
}

export async function createShipment(orderPayload: Record<string, unknown>) {
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}/orders/create/adhoc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderPayload),
  });
  if (!res.ok) throw new Error("Failed to create Shiprocket shipment.");
  return res.json();
}

export async function trackShipment(awbCode: string) {
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}/courier/track/awb/${awbCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
