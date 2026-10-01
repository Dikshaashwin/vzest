import { TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, rows = 4, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-cocoa-600"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={clsx(
            "w-full rounded border bg-white px-3.5 py-2.5 text-sm text-cocoa-900 placeholder:text-cocoa-300 focus:outline-none",
            error
              ? "border-danger-600 bg-danger-50 focus:border-danger-600"
              : "border-cocoa-200 focus:border-cocoa-800",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-xs text-danger-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-cocoa-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
