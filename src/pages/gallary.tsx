import React from "react";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sketch, User } from "@prisma/client";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { IconButton } from "@/components/IconButton";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import { displayToast, ToastVariant } from "@/components/ui/Toast";
import { isValidUrl } from "@/lib/utils";
import { useDrawStore } from "@/state/drawStore";
import { SOMETHING_WENT_WRONG } from "@/lib/constants";

interface GallaryPageProps {
  user: User;
  userSketches: Sketch[];
}

export default function GallaryPage({ user, userSketches }: GallaryPageProps) {
  const [sketches, setSketches] = React.useState(userSketches);
  const [_error, setError] = React.useState<string | null>(null);
  const { setSketch, setSrcFromGallary, reset } = useDrawStore(
    (state) => state
  );
  const router = useRouter();

  const deleteHandler = React.useCallback(
    async (sketchUrl: string) => {
      if (!user || !sketchUrl) return;

      const validateUrl = isValidUrl(sketchUrl);
      if (!validateUrl) return;

      try {
        setError(null);
        const response = await fetch(`/api/upload?sketchUrl=${sketchUrl}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data?.message || SOMETHING_WENT_WRONG);
          displayToast(
            data?.message || SOMETHING_WENT_WRONG,
            ToastVariant.ERROR
          );
          return;
        }

        const updatedSketches = sketches.filter(
          (sketch) => sketch.url !== sketchUrl
        );
        setSketches(updatedSketches);

        displayToast("Sketch successfully deleted", ToastVariant.SUCCESS);
      } catch (error) {
        console.error(error);
      }
    },
    [sketches, user]
  );

  const imageHandler = React.useCallback(
    (sketchUrl: string) => {
      if (!user || !sketchUrl) return;

      reset();
      setSketch(sketchUrl);
      setSrcFromGallary(true);
      router.push("/");
    },
    [user, router, setSketch, reset, setSrcFromGallary]
  );

  return (
    <Container className="items-center">
      <Header />
      <h1 className="mt-4 text-2xl font-semibold tracking-tighter">
        Sketch Gallary
      </h1>
      <main className="container my-2 grid flex-1 grid-cols-1 gap-3 p-2 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {sketches.map((sketch) => (
            <motion.div
              key={sketch.id}
              className="mt-3 flex flex-col p-2"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0, y: 0 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Image
                alt="sketch image"
                src={sketch.url}
                className="max-h-[500px] w-full max-w-[500] rounded-2xl border border-slate-900"
                width={500}
                height={500}
              />
              <div className="mt-1 flex justify-end p-1">
                <IconButton
                  icon={<PencilIcon />}
                  onClick={() => imageHandler(sketch.url)}
                  className="mx-2"
                />
                <IconButton
                  icon={<TrashIcon />}
                  onClick={() => deleteHandler(sketch.url)}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <Toaster />
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
      userSketches: sketches,
    },
  };
}
