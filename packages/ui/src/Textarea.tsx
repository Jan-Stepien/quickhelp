import React from "react";
import { cn } from "./cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  mono?: boolean;
}

export function Textarea({ mono = true, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        mono && "font-mono",
        className
      )}
      {...props}
    />
  );
}
