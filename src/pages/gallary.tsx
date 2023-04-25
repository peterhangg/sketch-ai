import React from "react";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { motion } from "framer-motion";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sketch, User } from "@prisma/client";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { blobUrlToDataURL } from "@/lib/utils";

interface GallaryPageProps {
  user: User;
  sketches: Sketch[];
}

export default function GallaryPage({ user, sketches }: GallaryPageProps) {
  return (
    <Container>
      <Header />
      <h1>Sketch Gallary</h1>
      <main className="container flex flex-1 flex-row flex-wrap justify-center p-3">
        {sketches.map((sketch, index) => (
          <motion.div
            key={sketch.id}
            className="mt-3 p-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.1 * index, duration: 0.2 }}
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0 },
            }}
          >
            <Image
              alt="sketch image"
              src={sketch.url}
              className="max-h-[500px] max-w-[500] rounded-2xl border border-slate-900"
              width={500}
              height={500}
            />
          </motion.div>
        ))}
      </main>
      <Footer />
    </Container>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || !session?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const userId = session.user.id;
  const sketches = await prisma.sketch.findMany({
    where: {
      userId,
    },
  });

  return {
    props: {
      user: session.user || null,
      sketches,
    },
  };
}
