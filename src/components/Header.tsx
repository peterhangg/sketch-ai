import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonStyles } from "./ui/Button";
import AppIcon from "../../public/app-icon.png";

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
        <Link className="flex items-center" href="/">
          <Image src={AppIcon} alt="App icon" width={40} height={50} />
          <span className=" ml-2 text-2xl font-semibold tracking-tighter">
            Sketch AI
          </span>
        </Link>
        {session ? (
          <div>
            <Link
              href="/gallery"
              className={cn(buttonStyles({ variant: "light" }), "mr-2")}
            >
              Gallery
            </Link>
            <button
              className={cn(buttonStyles({}))}
              onClick={() =>
                signOut({
                  callbackUrl: "/",
                })
              }
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className={cn(buttonStyles({}))}>
            Login
          </Link>
        )}
      </nav>
    </motion.header>
  );
}
