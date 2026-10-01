"use client";

import { useState, useTransition } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toggleSectionVisibility, moveSectionPosition } from "@/lib/actions/homepage";
import type { HomepageSection } from "@prisma/client";

export function HomepageSectionRow({
  section,
  isFirst,
  isLast,
}: {
  section: HomepageSection;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(section.isActive);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-cocoa-100 bg-white p-4">
      <div className="flex flex-col gap-1 text-cocoa-300">
        <button disabled={isFirst || isPending} onClick={() => startTransition(() => moveSectionPosition(section.id, "up"))} className="disabled:opacity-30">
          <ArrowUp size={14} />
        </button>
        <button disabled={isLast || isPending} onClick={() => startTransition(() => moveSectionPosition(section.id, "down"))} className="disabled:opacity-30">
          <ArrowDown size={14} />
        </button>
      </div>

      <div className="flex-1">
        <p className="font-semibold text-cocoa-900">{section.title}</p>
        <p className="mt-0.5 text-xs text-cocoa-500">{section.subtitle}</p>
      </div>

      <StatusBadge tone={active ? "success" : "danger"}>{active ? "Visible" : "Hidden"}</StatusBadge>

      <button
        disabled={isPending}
        onClick={() => {
          setActive((v) => !v);
          startTransition(() => toggleSectionVisibility(section.id, !active));
        }}
        className="text-xs font-semibold uppercase tracking-wider text-cocoa-600 underline disabled:opacity-50"
      >
        {active ? "Hide" : "Show"}
      </button>
    </div>
  );
}
