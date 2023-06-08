import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: React.HTMLAttributes<HTMLElement>["className"];
}

export function Footer({ className }: FooterProps) {
  return (
    <motion.footer
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
      variants={{
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
      }}
    >
      <div className="container mx-auto border-t border-t-slate-500 bg-white px-4 py-8">
        <div className="text-center text-sm md:text-left">
          Built with{" "}
          <a
            className="font-bold underline underline-offset-4 transition hover:text-black/70"
            href="https://nextjs.org"
            target="_blank"
            rel="noreferrer"
          >
            Next.js
          </a>
          ,{" "}
          <a
            className="font-bold underline underline-offset-4 transition hover:text-black/70"
            href="https://vercel.com"
            target="_blank"
            rel="noreferrer"
          >
            Vercel
          </a>
          ,{" "}
          <a
            className="font-bold underline underline-offset-4 transition hover:text-black/70"
            href="https://replicate.com"
            target="_blank"
            rel="noreferrer"
          >
            Replicate
          </a>
          ,{" "}
          <a
            className="font-bold underline underline-offset-4 transition hover:text-black/70"
            href="https://aws.amazon.com"
            target="_blank"
            rel="noreferrer"
          >
            AWS
          </a>
          .
        </div>
      </div>
    </motion.footer>
  );
}
