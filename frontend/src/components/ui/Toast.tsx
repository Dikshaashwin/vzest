"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import clsx from "clsx";
import type { BadgeTone } from "./StatusBadge";

type Toast = { id: number; tone: BadgeTone; title: string; message?: string };

const ToastContext = createContext<{ push: (t: Omit<Toast, "id">) => void } | null>(null);

const iconMap: Record<BadgeTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  neutral: Info,
};

const iconColor: Record<BadgeTone, string> = {
  success: "text-success-600",
  danger: "text-danger-600",
  warning: "text-warning-600",
  info: "text-info-600",
  neutral: "text-cocoa-400",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 5000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.tone];
          return (
            <div
              key={toast.id}
              className="flex w-80 items-start gap-3 rounded-lg border border-cocoa-100 bg-white p-4 shadow-lg"
            >
              <Icon size={18} className={clsx("mt-0.5 flex-shrink-0", iconColor[toast.tone])} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-cocoa-900">{toast.title}</p>
                {toast.message && <p className="mt-0.5 text-xs text-cocoa-500">{toast.message}</p>}
              </div>
              <button onClick={() => dismiss(toast.id)} className="text-cocoa-300 hover:text-cocoa-700">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.push;
}
