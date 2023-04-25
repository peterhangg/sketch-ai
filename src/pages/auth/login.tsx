import React from "react";
import Image from "next/image";
import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { Container } from "@/components/ui/Container";
import { buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { GOOGLE } from "@/lib/constants";
import { getServerAuthSession } from "@/lib/auth";
import GoogleIcon from "../../../public/google.png";

export default function LoginPage() {
  return (
    <Container>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        variants={{
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 },
        }}
      >
        <Link
          href="/"
          className={cn(buttonStyles({ size: "lg" }), "absolute left-8 top-8")}
        >
          <>
            <ChevronLeftIcon className="mr-2 h-4 w-4" />
            Back
          </>
        </Link>
      </motion.div>
      <motion.div
        className="container flex h-full flex-col items-center justify-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        variants={{
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 },
        }}
      >
        <h1 className="mb-1 p-2 text-2xl">Sign in to save your sketches</h1>
        <button
          className={cn(
            buttonStyles({ size: "lg" }),
            "flex items-center space-x-3"
          )}
          onClick={() =>
            signIn(GOOGLE, {
              callbackUrl: "/",
            })
          }
        >
          <Image src={GoogleIcon} width={20} height={20} alt="Google logo" />
          <span>Sign in with Google</span>
        </button>
      </motion.div>
    </Container>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
