import React from "react";
import { cn } from "./cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "default", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-accent text-accent-foreground hover:bg-accent/90",
        variant === "outline" && "border border-border bg-background text-foreground hover:bg-muted",
        variant === "ghost" && "text-foreground hover:bg-muted",
        size === "sm" && "h-7 px-3 text-xs",
        size === "md" && "h-9 px-4 text-sm",
        size === "lg" && "h-11 px-6 text-base",
        className
      )}
      {...props}
    />
  );
}
