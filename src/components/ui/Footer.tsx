import React from "react";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      className="container mx-auto border-t border-t-slate-500 bg-white px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
      variants={{
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
      }}
    ></motion.footer>
  );
}
