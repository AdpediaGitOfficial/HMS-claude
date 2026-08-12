import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm text-[13.5px] font-semibold px-4 py-2 transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white hover:bg-accent-hover active:bg-accent-strong",
        secondary:
          "bg-surface border border-border-strong text-text hover:border-accent hover:text-accent-hover hover:bg-accent-tint",
        ghost: "bg-transparent text-text-muted hover:text-text hover:bg-surface-2",
        danger: "bg-critical-soft text-critical hover:bg-critical hover:text-white",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant }), className)} {...props} />
  ),
);
Button.displayName = "Button";
