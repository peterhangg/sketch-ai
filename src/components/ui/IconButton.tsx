import React from "react";
import { cn } from "@/lib/utils";

interface IconButtonProps {
  icon: React.ReactNode;
  className?: React.HTMLAttributes<HTMLElement>["className"];
  onClick?: () => void;
  disabled?: boolean;
}

export const IconButton = ({ icon, className, ...props }: IconButtonProps) => {
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
