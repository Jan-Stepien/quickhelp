import React from "react";
import { cn } from "./cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({ options, className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "appearance-none bg-[right_0.75rem_center] bg-no-repeat",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2371717a' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        paddingRight: "2.5rem",
      }}
      {...props}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
