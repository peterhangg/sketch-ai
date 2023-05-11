import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonStyles = cva(
  "inline-flex items-center justify-center font-bold disabled:pointer-events-none disabled:opacity-50 transition duration-500",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-600",
        light: "bg-white border text-black hover:bg-slate-900 hover:text-white",
      },
      size: {
        default: "h-11 px-4 py-3 rounded-md",
        sm: "h-10 px-2 py-2 rounded-md",
        lg: "h-12 px-6 py-4 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonStyles({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
