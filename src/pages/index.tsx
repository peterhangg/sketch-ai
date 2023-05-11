import React from "react";
import Head from "next/head";
import Image from "next/image";
import { GetServerSidePropsContext } from "next";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { useDrawStore } from "@/state/drawStore";
import { Canvas } from "@/components/Canvas";
import { PromptForm } from "@/components/PromptForm";
import { Header } from "@/components/ui/Header";
import { Container } from "@/components/ui/Container";
import { Spinner } from "@/components/ui/Spinner";
import { Footer } from "@/components/ui/Footer";
import { buttonStyles } from "@/components/ui/Button";
import { IconButton } from "@/components/IconButton";
import { displayToast, ToastVariant } from "@/components/ui/Toast";
import { blobToBase64, downloadImage } from "@/lib/blob";
import { getServerAuthSession } from "@/lib/auth";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import ErrorPlaceholder from "../../public/error.png";

interface HomeProps {
  user: User | null;
}

export default function Home({ user }: HomeProps) {
  const [_error, setError] = React.useState<string | null>(null);
  const {
    sketch,
    generatedImage,
    submitted,
    loading,
    reset,
    sketchBlob,
    generateError,
    saved,
    setSaved,
  } = useDrawStore((state) => state);

  const backHandler = React.useCallback((): void => {
    reset();
  }, [reset]);

  const saveHandler = React.useCallback(async () => {
    if (!user) {
      displayToast("Must log in to save sketch", ToastVariant.WARNING);
      return;
    }

    if (saved) return;

    const sketchBase64Data = await blobToBase64(sketchBlob as Blob);
    if (!sketchBase64Data) return;

    const formData = new FormData();
    formData.append("sketchData", sketchBase64Data);

    try {
      setError(null);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Something went wrong");
        displayToast(
          data?.message || "Something went wrong",
          ToastVariant.ERROR
        );
        return;
      }
      setSaved(true);
      displayToast("Sketch was saved", ToastVariant.SUCCESS);
    } catch (error) {
      console.error(error);
    }
  }, [user, sketchBlob, setError, saved, setSaved]);

  return (
    <>
      <Head>
        <title>Sketch AI</title>
        <meta name="description" content="AI generated image from sketch" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center">
          {!submitted ? (
            <>
              <motion.h1
                className="text-2xl font-semibold tracking-tighter"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                variants={{
                  hidden: { opacity: 0, x: 50 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                Turn your sketch into AI generated image
              </motion.h1>
              <motion.div
                className="mt-3 p-2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                variants={{
                  hidden: { opacity: 0, x: -50 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <Canvas />
                <PromptForm />
              </motion.div>
            </>
          ) : (
            <AnimatePresence>
              <motion.h1
                key="11"
                className="mb-10 text-2xl font-semibold tracking-tighter"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                variants={{
                  hidden: { opacity: 0, x: 50 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                AI Generated Image Results:
              </motion.h1>
              <motion.div
                key="22"
                className="container m-3 flex h-[500px] w-[80%] items-center justify-around p-2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                variants={{
                  hidden: { opacity: 0, x: -50 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                {sketch && (
                  <div className="flex flex-col">
                    <Image
                      alt="sketch drawing"
                      src={sketch}
                      className="max-h-[500px] max-w-[500] rounded-2xl border border-slate-900"
                      unoptimized={true}
                      width={500}
                      height={500}
                    />
                    <div className="flex justify-end p-1">
                      <IconButton
                        icon={
                          <StarIcon
                            className={saved ? "fill-yellow-500" : ""}
                          />
                        }
                        onClick={saveHandler}
                        disabled={saved}
                      />
                    </div>
                  </div>
                )}
                {loading && <Spinner />}
                {!loading && (
                  <div className="flex flex-col">
                    <Image
                      alt="generated image"
                      src={generateError ? ErrorPlaceholder : generatedImage}
                      className="max-h-[500px] max-w-[500] rounded-2xl border border-slate-900"
                      width={500}
                      height={500}
                    />
                    <div className="flex justify-end p-1">
                      <IconButton
                        icon={<ArrowDownTrayIcon />}
                        onClick={() => downloadImage(generatedImage)}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
              <motion.div
                className="mt-4 p-2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                variants={{
                  hidden: { opacity: 0, x: 50 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <button
                  className={cn(buttonStyles({ size: "lg" }))}
                  onClick={backHandler}
                  disabled={loading}
                >
                  <ChevronLeftIcon className="mr-2 h-4 w-4" />
                  Start a new sketch
                </button>
              </motion.div>
            </AnimatePresence>
          )}
          <Toaster />
        </main>
        <Footer />
      </Container>
    </>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  return {
    props: {
      user: session?.user || null,
    },
  };
}
