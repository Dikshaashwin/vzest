import { SelectHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, className, id, children, ...props }, ref) => {
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
        <div className="relative">
          <select
            id={inputId}
            ref={ref}
            className={clsx(
              "w-full appearance-none rounded border bg-white px-3.5 py-2.5 pr-9 text-sm text-cocoa-900 focus:outline-none",
              error
                ? "border-danger-600 bg-danger-50 focus:border-danger-600"
                : "border-cocoa-200 focus:border-cocoa-800",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-400"
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-danger-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-cocoa-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";
