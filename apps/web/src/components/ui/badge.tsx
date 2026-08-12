import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Status representation, not decoration: every tone pairs a soft
 * background + colored text with the icon the caller passes as children —
 * never color alone (§10 principle 02).
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full text-[12px] font-bold px-2.5 py-1",
  {
    variants: {
      tone: {
        neutral: "bg-surface-2 text-text-muted",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        critical: "bg-critical-soft text-critical",
        info: "bg-info-soft text-info",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
