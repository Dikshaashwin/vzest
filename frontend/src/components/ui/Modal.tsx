"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa-900/40 p-4">
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-4 border-b border-cocoa-100 pb-4">
          <h3 className="font-serif text-lg font-semibold text-cocoa-900">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-cocoa-400 hover:text-cocoa-800">
            <X size={20} />
          </button>
        </div>
        <div className="py-4 text-sm text-cocoa-600">{children}</div>
        {footer && <div className="flex justify-end gap-3 pt-2">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
