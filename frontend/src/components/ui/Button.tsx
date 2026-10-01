import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:border-cocoa-100 disabled:bg-cocoa-50 disabled:text-cocoa-300";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "rounded bg-cocoa-900 text-cream-50 hover:bg-cocoa-700 border border-cocoa-900 disabled:border-cocoa-50",
  secondary: "rounded border border-cocoa-800 text-cocoa-900 hover:bg-cocoa-50",
  tertiary: "text-cocoa-900 hover:text-cocoa-600 disabled:text-cocoa-300",
  danger: "rounded bg-danger-600 text-white hover:bg-danger-600/90 border border-danger-600",
};

const sizeClasses: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: { sm: "h-9 px-4 text-[11px]", md: "h-12 px-6 text-xs", lg: "h-14 px-8 text-sm" },
  secondary: { sm: "h-9 px-4 text-[11px]", md: "h-12 px-6 text-xs", lg: "h-14 px-8 text-sm" },
  danger: { sm: "h-9 px-4 text-[11px]", md: "h-12 px-6 text-xs", lg: "h-14 px-8 text-sm" },
  tertiary: { sm: "text-[11px]", md: "text-xs", lg: "text-sm" },
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  withArrow?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", withArrow, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(base, variantClasses[variant], sizeClasses[variant][size], className)}
      {...props}
    >
      {children}
      {withArrow && <ArrowRight size={14} />}
    </button>
  )
);
Button.displayName = "Button";

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  withArrow,
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  withArrow?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(base, variantClasses[variant], sizeClasses[variant][size], className)}
    >
      {children}
      {withArrow && <ArrowRight size={14} />}
    </Link>
  );
}
