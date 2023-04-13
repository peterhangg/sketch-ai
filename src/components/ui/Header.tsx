import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonStyles } from "./Button";

export function Header() {
  return (
    <header className="container sticky top-0 z-50 mx-auto bg-white px-4">
      <div className="flex items-center justify-between border-b border-b-slate-500 py-4">
        <div>
          <h1 className="text-lg">Sketch AI</h1>
        </div>
        <nav>
          <Link href="/login" className={cn(buttonStyles({ size: "lg" }))}>
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
