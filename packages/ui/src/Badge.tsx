import React from "react";
import { cn } from "./cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success" | "danger" | "muted";
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-accent text-accent-foreground",
        variant === "outline" && "border border-border text-foreground",
        variant === "success" && "bg-success/15 text-success",
        variant === "danger" && "bg-danger/15 text-danger",
        variant === "muted" && "bg-muted text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}
