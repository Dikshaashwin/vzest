"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";
import type { OrderStatus } from "@prisma/client";

const STATUSES: OrderStatus[] = [
  "PAYMENT_PENDING",
  "PAID",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "READY_TO_SHIP",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const nextStatus = e.target.value as OrderStatus;
        startTransition(() => {
          void updateOrderStatus(orderId, nextStatus);
        });
      }}
      className="rounded-lg border border-cocoa-200 px-3 py-1.5 text-sm focus:border-cocoa-800 focus:outline-none disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replaceAll("_", " ")}
        </option>
      ))}
    </select>
  );
}
