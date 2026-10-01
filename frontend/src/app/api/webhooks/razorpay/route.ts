import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/services/razorpay";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/lib/actions/orders";

// Configure this URL + RAZORPAY_WEBHOOK_SECRET in the Razorpay dashboard.
// This is the source of truth for payment confirmation — the client-side
// verify call is a fast path for UX only.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const razorpayOrderId = payment.order_id as string;

    const existingPayment = await prisma.payment.findFirst({
      where: { razorpayOrderId },
      include: { order: true },
    });

    if (existingPayment && existingPayment.status !== "PAID") {
      await markOrderPaid(existingPayment.orderId, {
        razorpayOrderId,
        razorpayPaymentId: payment.id,
        razorpaySignature: signature,
      });
    }
  }

  return NextResponse.json({ received: true });
}
