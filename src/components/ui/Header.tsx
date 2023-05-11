import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonStyles } from "./Button";

export function Header() {
  const { data: session } = useSession();
  return (
    <motion.header
      className="container sticky top-0 z-50 mx-auto bg-white px-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
      variants={{
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
      }}
    >
      <nav className="flex w-full items-center justify-between border-b border-b-slate-500 py-4">
        <Link className="text-2xl font-semibold tracking-tighter" href="/">
          Sketch AI
        </Link>
        {session ? (
          <div>
            <Link
              href="/gallary"
              className={cn(
                buttonStyles({ variant: "light", size: "lg" }),
                "mr-3"
              )}
            >
              Gallary
            </Link>
            <button
              className={cn(buttonStyles({ size: "lg" }))}
              onClick={() => {
                signOut();
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className={cn(buttonStyles({ size: "lg" }))}>
            Login
          </Link>
        )}
      </nav>
    </motion.header>
  );
}
