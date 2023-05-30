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
import { DISCORD, GOOGLE } from "@/lib/constants";
import { getServerAuthSession } from "@/lib/auth";
import GoogleIcon from "../../../public/google.svg";
import DiscordIcon from "../../../public/discord.svg";

export default function LoginPage() {
  return (
    <Container className="items-center justify-center">
      <motion.div
        className="absolute left-2 top-2 md:left-8 md:top-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        variants={{
          hidden: { opacity: 0, x: -50 },
          visible: { opacity: 1, x: 0 },
        }}
      >
        <Link
          href="/"
          className={cn(
            buttonStyles({ variant: "light", size: "lg" }),
            "border-none"
          )}
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
        <h1 className="mb-1 p-2 text-2xl font-bold tracking-tighter">
          Welcome Back
        </h1>
        <p className="text-sm text-gray-600">
          Save your sketches by signing in
        </p>
        <button
          className={cn(
            buttonStyles({ size: "lg" }),
            "mt-3 flex items-center space-x-3"
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
        <button
          className={cn(
            buttonStyles({ size: "lg" }),
            "mt-3 flex items-center space-x-3"
          )}
          onClick={() =>
            signIn(DISCORD, {
              callbackUrl: "/",
            })
          }
        >
          <Image src={DiscordIcon} width={20} height={20} alt="Discord logo" />
          <span>Sign in with Discord</span>
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
