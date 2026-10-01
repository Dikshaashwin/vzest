"use client";

import { useState } from "react";
import { formatDate, formatINR } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { trackOrder } from "@/lib/actions/orders";
import type { Order as TrackedOrder } from "@/lib/api/types";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const result = await trackOrder(orderNumber, email);
      if (!result) throw new Error("No matching order found.");
      setOrder(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">Track Your Order</h1>
      <p className="mt-2 text-sm text-cocoa-500">
        Enter your order number and the email used at checkout.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          required
          placeholder="Order number (e.g. VZ1A2B3C)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="w-full rounded-lg border border-cocoa-200 px-3 py-2 focus:border-cocoa-800 focus:outline-none"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-cocoa-200 px-3 py-2 focus:border-cocoa-800 focus:outline-none"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Searching..." : "Track Order"}
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {order && (
        <div className="mt-8 rounded-2xl border border-cocoa-100 p-6">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-cocoa-900">{order.orderNumber}</p>
            <span className="rounded-full bg-cocoa-50 px-3 py-1 text-xs font-medium text-cocoa-700">
              {order.status.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-1 text-xs text-cocoa-400">Placed on {formatDate(order.createdAt)}</p>

          <ul className="mt-4 space-y-1 text-sm text-cocoa-600">
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.name} ({item.variantLabel}) × {item.quantity}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm font-semibold text-cocoa-800">Total: {formatINR(order.total)}</p>

          {order.shipment?.awbCode && (
            <p className="mt-2 text-xs text-cocoa-500">
              Courier: {order.shipment.courierName} · AWB: {order.shipment.awbCode}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
