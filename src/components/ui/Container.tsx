import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ className, children }: Props) {
  return (
    <div className={cn("flex min-h-screen w-screen flex-col", className)}>
      {children}
    </div>
  );
}
