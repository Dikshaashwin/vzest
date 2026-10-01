import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrderByNumber } from "@/lib/actions/orders";

const schema = z.object({ orderNumber: z.string().min(4), email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const order = await getOrderByNumber(parsed.data.orderNumber.trim().toUpperCase());

  if (!order || order.customerEmail.toLowerCase() !== parsed.data.email.toLowerCase()) {
    return NextResponse.json({ error: "No matching order found." }, { status: 404 });
  }

  return NextResponse.json({ order });
}
