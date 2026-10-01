"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { deleteAddress, setDefaultAddress } from "@/lib/actions/addresses";
import { AddressForm } from "@/components/storefront/AddressForm";
import type { Address } from "@/lib/api/types";

export function AddressList({ addresses }: { addresses: Address[] }) {
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {addresses.map((addr) => (
        <div key={addr.id} className="rounded-2xl border border-cocoa-100 p-5">
          <div className="flex items-start justify-between">
            <p className="font-semibold text-cocoa-900">{addr.fullName}</p>
            {addr.isDefault && (
              <span className="rounded-full bg-cocoa-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Default
              </span>
            )}
          </div>
          <div className="mt-2 space-y-0.5 text-sm text-cocoa-500">
            <p>{addr.line1}</p>
            {addr.line2 && <p>{addr.line2}</p>}
            <p>{addr.city}, {addr.state}, {addr.pincode}</p>
            <p>{addr.country}</p>
            <p>Phone: {addr.phone}</p>
          </div>
          <div className="mt-4 flex gap-4 text-xs font-semibold uppercase tracking-wider">
            <button
              disabled={isPending}
              onClick={() => startTransition(() => deleteAddress(addr.id))}
              className="text-danger-600 underline disabled:opacity-50"
            >
              Delete
            </button>
            {!addr.isDefault && (
              <button
                disabled={isPending}
                onClick={() => startTransition(() => setDefaultAddress(addr.id))}
                className="text-cocoa-600 underline disabled:opacity-50"
              >
                Set as Default
              </button>
            )}
          </div>
        </div>
      ))}

      {adding ? (
        <AddressForm onDone={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-cocoa-300 p-5 text-cocoa-500 hover:border-cocoa-500"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cocoa-100">
            <Plus size={16} />
          </span>
          <span className="text-sm font-medium">Add New Address</span>
          <span className="text-xs text-cocoa-400">Save a new shipping or billing destination.</span>
        </button>
      )}
    </div>
  );
}
