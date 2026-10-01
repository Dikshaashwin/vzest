import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validators";
import { createOrder, priceCart } from "@/lib/actions/orders";
import { createRazorpayOrder } from "@/lib/services/razorpay";
import { z } from "zod";

const bodySchema = checkoutSchema.extend({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10).max(15),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const input = bodySchema.parse(json);

    const order = await createOrder(input);
    const pricing = await priceCart(input);

    const amountInPaise = Math.round(pricing.total * 100);
    const razorpayOrder = await createRazorpayOrder(amountInPaise, order.orderNumber);

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
