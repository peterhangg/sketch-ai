import React from "react";
import { cn } from "@/lib/utils";

interface LoaderOverlayProps {
  className?: React.HTMLAttributes<HTMLElement>["className"];
}

export function LoaderOverlay({ className }: LoaderOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-200 opacity-50",
        className
      )}
    >
      <div className="h-7 w-7 animate-ripple rounded-full border-4 border-white"></div>
    </div>
  );
}
