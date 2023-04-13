import React from "react";
import { cn } from "@/lib/utils";

interface CanvasButtonProps {
  icon: JSX.Element;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const CanvasButton = ({
  icon,
  className,
  ...props
}: CanvasButtonProps) => {
  return (
    <button
      className={cn(
        "h-6 w-6 text-slate-700 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
};
