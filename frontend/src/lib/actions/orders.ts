"use server";

import { prisma } from "@/lib/prisma";
import { checkoutSchema, type CheckoutInput } from "@/lib/validators";
import { generateOrderNumber } from "@/lib/format";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";
import { recordInventoryMovement } from "@/lib/actions/inventory";

const SHIPPING_FLAT_FEE = 80;
const FREE_SHIPPING_THRESHOLD = 999;
const EXPRESS_SHIPPING_FEE = 250;

export async function priceCart(input: CheckoutInput) {
  const data = checkoutSchema.parse(input);

  const variantIds = data.items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  let subtotal = 0;
  const lineItems = data.items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) throw new Error("Product variant not found.");
    if (variant.stock < item.quantity) {
      throw new Error(`${variant.product.name} (${variant.label}) is out of stock.`);
    }
    const lineTotal = Number(variant.price) * item.quantity;
    subtotal += lineTotal;
    return { ...item, variant, lineTotal };
  });

  let discount = 0;
  if (data.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: data.couponCode } });
    if (coupon && coupon.isActive) {
      const meetsMin = !coupon.minOrderValue || subtotal >= Number(coupon.minOrderValue);
      if (meetsMin) {
        discount =
          coupon.type === "PERCENTAGE"
            ? (subtotal * Number(coupon.value)) / 100
            : Number(coupon.value);
        if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    }
  }

  const shippingFee =
    data.shippingMethod === "express"
      ? EXPRESS_SHIPPING_FEE
      : subtotal - discount >= FREE_SHIPPING_THRESHOLD
        ? 0
        : SHIPPING_FLAT_FEE;
  const gstAmount = lineItems.reduce(
    (sum, item) => sum + (item.lineTotal * Number(item.variant.gstPercent)) / 100,
    0
  );
  const total = subtotal - discount + shippingFee + gstAmount;

  return { lineItems, subtotal, discount, shippingFee, gstAmount, total };
}

export async function createOrder(
  input: CheckoutInput & { customerName: string; customerEmail: string; customerPhone: string; userId?: string }
) {
  const pricing = await priceCart(input);

  const order = await prisma.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: {
        userId: input.userId ?? (await ensureGuestUser(input.customerEmail, input.customerName)),
        fullName: input.address.fullName,
        phone: input.address.phone,
        line1: input.address.line1,
        line2: input.address.line2,
        city: input.address.city,
        state: input.address.state,
        pincode: input.address.pincode,
      },
    });

    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: address.userId,
        addressId: address.id,
        status: "PAYMENT_PENDING",
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        shippingFee: pricing.shippingFee,
        gstAmount: pricing.gstAmount,
        total: pricing.total,
        couponCode: input.couponCode,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        items: {
          create: pricing.lineItems.map((item) => ({
            productId: item.variant.productId,
            variantId: item.variant.id,
            name: item.variant.product.name,
            variantLabel: item.variant.label,
            price: item.variant.price,
            quantity: item.quantity,
          })),
        },
        payment: { create: { amount: pricing.total, status: "PENDING" } },
      },
      include: { items: true },
    });

    return newOrder;
  });

  return order;
}

async function ensureGuestUser(email: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing.id;
  const created = await prisma.user.create({ data: { email, name, role: "CUSTOMER" } });
  return created.id;
}

/** Call after the Razorpay webhook/signature check confirms payment — never trust the client alone. */
export async function markOrderPaid(orderId: string, razorpay: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "CONFIRMED",
      payment: {
        update: {
          status: "PAID",
          razorpayOrderId: razorpay.razorpayOrderId,
          razorpayPaymentId: razorpay.razorpayPaymentId,
          razorpaySignature: razorpay.razorpaySignature,
        },
      },
    },
    include: { items: true },
  });

  for (const item of order.items) {
    await recordInventoryMovement({
      variantId: item.variantId,
      change: -item.quantity,
      reason: "ORDER_PLACED",
      orderId: order.id,
    });
  }

  revalidatePath("/admin/orders");
  return order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await prisma.order.update({ where: { id: orderId }, data: { status }, include: { items: true } });

  if (status === "CANCELLED" || status === "RETURNED") {
    for (const item of order.items) {
      await recordInventoryMovement({
        variantId: item.variantId,
        change: item.quantity,
        reason: status === "CANCELLED" ? "ORDER_CANCELLED" : "RETURN_RESTOCK",
        orderId: order.id,
      });
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/account/orders/${orderId}`);
  return order;
}

export async function listOrdersForAdmin(status?: OrderStatus) {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { items: true, payment: true, shipment: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, payment: true, shipment: true, address: true },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true, shipment: true, address: true },
  });
}
