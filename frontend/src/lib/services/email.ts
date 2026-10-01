import { Resend } from "resend";

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
  return new Resend(apiKey);
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "orders@zestchocolates.example";

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  total: string;
}) {
  const client = getClient();
  return client.emails.send({
    from: FROM,
    to: params.to,
    subject: `Order confirmed — ${params.orderNumber}`,
    html: `<p>Thank you for your order!</p><p>Order <strong>${params.orderNumber}</strong> for <strong>${params.total}</strong> has been confirmed.</p>`,
  });
}

export async function sendOrderStatusEmail(params: {
  to: string;
  orderNumber: string;
  status: string;
}) {
  const client = getClient();
  return client.emails.send({
    from: FROM,
    to: params.to,
    subject: `Order ${params.orderNumber} update: ${params.status}`,
    html: `<p>Your order <strong>${params.orderNumber}</strong> status is now <strong>${params.status}</strong>.</p>`,
  });
}
