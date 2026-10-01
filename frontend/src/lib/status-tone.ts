import type { BadgeTone } from "@/components/ui/StatusBadge";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

export const ORDER_STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  DELIVERED: "success",
  SHIPPED: "info",
  OUT_FOR_DELIVERY: "info",
  PROCESSING: "warning",
  CONFIRMED: "warning",
  PAID: "warning",
  PAYMENT_PENDING: "neutral",
  PACKED: "warning",
  READY_TO_SHIP: "warning",
  CANCELLED: "danger",
  RETURNED: "danger",
  REFUNDED: "neutral",
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, BadgeTone> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "danger",
  REFUNDED: "neutral",
};
