import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type RadioProps = InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode };

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label htmlFor={inputId} className={clsx("flex cursor-pointer items-center gap-2.5 text-sm text-cocoa-700", className)}>
        <input
          id={inputId}
          ref={ref}
          type="radio"
          className="h-4 w-4 border-cocoa-300 text-cocoa-900 accent-cocoa-900 focus:outline-none"
          {...props}
        />
        {label}
      </label>
    );
  }
);
Radio.displayName = "Radio";
