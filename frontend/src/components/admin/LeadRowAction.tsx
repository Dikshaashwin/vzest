"use client";

import { useTransition } from "react";
import { markLeadHandled } from "@/lib/actions/leads";

export function LeadRowAction({ leadId, isHandled }: { leadId: string; isHandled: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => markLeadHandled(leadId, !isHandled))}
      className="text-xs font-medium text-gold-600 hover:underline disabled:opacity-50"
    >
      {isHandled ? "Mark Unhandled" : "Mark Handled"}
    </button>
  );
}
