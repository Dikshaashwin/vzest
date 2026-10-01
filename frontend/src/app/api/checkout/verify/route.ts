import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyRazorpaySignature } from "@/lib/services/razorpay";
import { markOrderPaid } from "@/lib/actions/orders";
import { sendOrderConfirmationEmail } from "@/lib/services/email";
import { formatINR } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  orderId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.parse(await req.json());

    const isValid = verifyRazorpaySignature({
      orderId: body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
      signature: body.razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }

    const order = await markOrderPaid(body.orderId, {
      razorpayOrderId: body.razorpay_order_id,
      razorpayPaymentId: body.razorpay_payment_id,
      razorpaySignature: body.razorpay_signature,
    });

    const orderWithCustomer = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    await sendOrderConfirmationEmail({
      to: orderWithCustomer.customerEmail,
      orderNumber: order.orderNumber,
      total: formatINR(Number(order.total)),
    }).catch((err) => console.error("[email send failed]", err));

    return NextResponse.json({ success: true, orderNumber: order.orderNumber });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
