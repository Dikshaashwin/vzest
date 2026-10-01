"use client";

import { useState } from "react";
import { adjustStock } from "@/lib/actions/inventory";
import { Button } from "@/components/ui/Button";

export function StockAdjustButton({ variantId }: { variantId: string }) {
  const [open, setOpen] = useState(false);
  const [change, setChange] = useState(0);
  const [reason, setReason] = useState<"RESTOCK" | "DAMAGED" | "MANUAL_ADJUSTMENT">("RESTOCK");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-gold-600 hover:underline">
        Adjust Stock
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6">
        <h3 className="text-sm font-semibold text-cocoa-800">Adjust Stock</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-cocoa-700">
              Change (use negative to remove)
            </span>
            <input
              type="number"
              value={change}
              onChange={(e) => setChange(Number(e.target.value))}
              className="w-full rounded-lg border border-cocoa-200 px-3 py-2 focus:border-cocoa-800 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-cocoa-700">Reason</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as typeof reason)}
              className="w-full rounded-lg border border-cocoa-200 px-3 py-2 focus:border-cocoa-800 focus:outline-none"
            >
              <option value="RESTOCK">Restock</option>
              <option value="DAMAGED">Damaged</option>
              <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-cocoa-700">Note (optional)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-cocoa-200 px-3 py-2 focus:border-cocoa-800 focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="tertiary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={submitting || change === 0}
            onClick={async () => {
              setSubmitting(true);
              await adjustStock({ variantId, change, reason, note: note || undefined });
              setSubmitting(false);
              setOpen(false);
              setChange(0);
              setNote("");
            }}
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
