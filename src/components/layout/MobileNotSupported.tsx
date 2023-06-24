"use client";

import React from "react";
import { useWindowSize } from "@/hooks/useWindowSize";

interface MobileProps {
  children: React.ReactNode;
}

export const MobileNotSupported = ({ children }: MobileProps) => {
  const { tailwindSize } = useWindowSize();

  return tailwindSize === "sm" ? (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center sm:hidden">
        <h1 className="text-2xl font-bold">Mobile not supported yet</h1>
        <p className="text-gray-700">
          Please use a desktop browser to view this page
        </p>
      </div>
    </div>
  ) : (
    <>{children}</>
  );
};
