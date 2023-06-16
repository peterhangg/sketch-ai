import React from "react";
import Image from "next/image";
import { GetServerSidePropsContext } from "next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { useDrawStore } from "@/state/drawStore";
import { Canvas } from "@/components/Canvas";
import { PromptForm } from "@/components/PromptForm";
import { Spinner } from "@/components/ui/Spinner";
import { Button, buttonStyles } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { displayToast, ToastVariant } from "@/components/ui/Toast";
import { blobToBase64, createBlob, downloadImage } from "@/lib/blob";
import { getServerAuthSession } from "@/lib/auth";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SKETCH, AI_IMAGE } from "@/lib/constants";
import ErrorPlaceholder from "../../public/error.png";

type ImageModel = "sketch" | "ai-image";
interface HomeProps {
  user: User | null;
}

export default function Home({ user }: HomeProps) {
  const {
    sketch,
    generatedImage,
    submitted,
    loading,
    reset,
    generateError,
    saved,
    setSaved,
  } = useDrawStore((state) => state);
  const [aiImageSaved, setAiImageSaved] = React.useState(false);

  const backHandler = React.useCallback((): void => {
    reset();
  }, [reset]);

  const saveHandler = React.useCallback(
    async (imageSrc: string, imageModel: ImageModel) => {
      if (!user) {
        displayToast(
          "Must log in to save sketch or image",
          ToastVariant.WARNING
        );
        return;
      }

      if (imageModel === SKETCH && saved) return;
      if (imageModel === AI_IMAGE && aiImageSaved) return;

      const imageBlob = await createBlob(imageSrc);
      const sketchBase64Data = await blobToBase64(imageBlob as Blob);
      if (!sketchBase64Data) return;

      const formData = new FormData();
      formData.append("sketchData", sketchBase64Data);
      formData.append("imageModel", imageModel);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
          displayToast(
            data?.message ||
              "Failed to save sketch/image. Please contact admin.",
            ToastVariant.ERROR
          );
          return;
        }
        if (imageModel === SKETCH) {
          setSaved(true);
          displayToast("Sketch was saved.", ToastVariant.SUCCESS);
        }

        if (imageModel === AI_IMAGE) {
          setAiImageSaved(true);
          displayToast("AI Image was saved.", ToastVariant.SUCCESS);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [user, setSaved, saved, aiImageSaved]
  );

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center">
        {!submitted ? (
          <>
            <motion.h1
              className="mt-2 text-center text-2xl font-semibold tracking-tighter"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              Turn your sketch into an AI generated image
            </motion.h1>
            <motion.div
              className="container mt-3 flex w-full items-center justify-center p-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              variants={{
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <div className="flex flex-col items-center justify-center p-2">
                <Canvas />
                <PromptForm />
              </div>
            </motion.div>
          </>
        ) : (
          <AnimatePresence>
            <motion.h1
              key="11"
              className="mt-4 text-2xl font-semibold tracking-tighter md:mb-2"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              AI Generated Image Results
            </motion.h1>
            <div className="container mt-4 flex flex-col items-center justify-center md:flex-row md:space-x-6">
              {sketch && (
                <motion.div
                  key="22"
                  className="flex h-full flex-col px-2"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  variants={{
                    hidden: { opacity: 0, x: -50 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <Image
                    alt="sketch drawing"
                    src={sketch}
                    className="h-full max-h-[600px] rounded-2xl border border-slate-900 shadow-card"
                    width={500}
                    height={600}
                  />
                  <div className="flex justify-end p-1">
                    <IconButton
                      className="mr-2"
                      icon={<ArrowDownTrayIcon />}
                      onClick={() => downloadImage(sketch)}
                    />
                    <IconButton
                      icon={
                        <StarIcon className={saved ? "fill-yellow-500" : ""} />
                      }
                      onClick={() => saveHandler(sketch, SKETCH)}
                      disabled={saved}
                    />
                  </div>
                </motion.div>
              )}

              {!loading && generatedImage && !generateError && (
                <motion.div
                  key="33"
                  className="mt-5 flex h-full flex-col md:mt-0"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  variants={{
                    hidden: { opacity: 0, x: -50 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <Image
                    alt="generated image"
                    src={generatedImage}
                    className="h-full max-h-[600px] rounded-2xl border border-slate-900 shadow-card"
                    width={500}
                    height={600}
                  />
                  <div className="flex justify-end p-1">
                    <IconButton
                      className="mr-2"
                      icon={<ArrowDownTrayIcon />}
                      onClick={() => downloadImage(generatedImage)}
                    />
                    <IconButton
                      icon={
                        <StarIcon
                          className={aiImageSaved ? "fill-yellow-500" : ""}
                        />
                      }
                      onClick={() => saveHandler(generatedImage, AI_IMAGE)}
                      disabled={aiImageSaved}
                    />
                  </div>
                </motion.div>
              )}

              {!loading && generateError && (
                <motion.div
                  key="44"
                  className="mt-5 flex h-full flex-col md:mt-0"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  variants={{
                    hidden: { opacity: 0, x: -50 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <Image
                    alt="Error image"
                    src={ErrorPlaceholder}
                    className="h-full max-h-[600px] rounded-2xl border border-slate-900 object-cover shadow-card"
                    width={500}
                    height={600}
                  />
                  <div className="flex justify-end p-1">
                    <IconButton
                      icon={<ArrowDownTrayIcon />}
                      onClick={() => downloadImage(generatedImage)}
                      disabled={true}
                    />
                  </div>
                </motion.div>
              )}
            </div>
            <motion.div
              key="44"
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
              <Button
                className={cn(buttonStyles({}))}
                onClick={backHandler}
                disabled={loading}
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <>
                    <ChevronLeftIcon className="mr-2 h-4 w-4" />
                    Start a new sketch
                  </>
                )}
              </Button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
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
