import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  icon?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", name, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex w-full rounded-md border border-slate-900 px-4 py-2 text-sm placeholder:text-slate-600 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        type={type}
        name={name}
        id={name}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
