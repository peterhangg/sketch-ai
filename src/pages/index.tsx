import React from "react";
import Image from "next/image";
import { GetServerSidePropsContext } from "next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { useDrawStore } from "@/store/drawStore";
import { useSaveStore } from "@/store/saveStore";
import { Canvas } from "@/components/Canvas";
import { PromptForm } from "@/components/PromptForm";
import { Spinner } from "@/components/ui/Spinner";
import { Button, buttonStyles } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { displayToast, ToastVariant } from "@/components/ui/Toast";
import { LoaderOverlay } from "@/components/ui/LoaderOverlay";
import { blobToBase64, createBlob, downloadImage } from "@/lib/blob";
import { getServerAuthSession } from "@/lib/auth";
import { ImageModel, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SKETCH, AI_IMAGE } from "@/lib/constants";
import ErrorPlaceholder from "../../public/error.png";

interface HomeProps {
  user: User | null;
}

export default function Home({ user }: HomeProps) {
  const {
    sketch,
    generatedImage,
    submitted,
    loading,
    prompt,
    reset,
    generateError,
  } = useDrawStore((state) => state);
  const {
    saveSketch,
    setSaveSketch,
    saveAiImage,
    setSaveAiImage,
    reset: resetSave,
  } = useSaveStore((state) => state);
  const [saveLoading, setSaveLoading] = React.useState<boolean>(false);
  const [imageModelType, setImageModelType] = React.useState<ImageModel | null>(
    null
  );

  const resetHandler = React.useCallback((): void => {
    reset();
    resetSave();
  }, [reset, resetSave]);

  const saveHandler = React.useCallback(
    async (imageSrc: string, imageModel: ImageModel) => {
      if (!user) {
        displayToast(
          "Must log in to save sketch or image",
          ToastVariant.WARNING
        );
        return;
      }

      if (imageModel === SKETCH && saveSketch) return;
      if (imageModel === AI_IMAGE && saveAiImage) return;

      const imageBlob = await createBlob(imageSrc);
      const sketchBase64Data = await blobToBase64(imageBlob as Blob);
      if (!sketchBase64Data) return;

      const formData = new FormData();
      formData.append("sketchData", sketchBase64Data);
      formData.append("imageModel", imageModel);

      setSaveLoading(true);
      setImageModelType(imageModel);
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
          setSaveSketch(true);
          displayToast("Sketch was saved.", ToastVariant.SUCCESS);
        }

        if (imageModel === AI_IMAGE) {
          setSaveAiImage(true);
          displayToast("AI Image was saved.", ToastVariant.SUCCESS);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSaveLoading(false);
        setImageModelType(null);
      }
    },
    [user, setSaveSketch, saveSketch, saveAiImage, setSaveAiImage]
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
            <motion.div
              key="11"
              className="flex max-w-[600px] flex-col items-center justify-center"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <h1 className="text-xl font-semibold tracking-tighter md:mb-0">
                AI Generated Image Results
              </h1>
              <p className="text-md font-medium tracking-tighter text-gray-700">
                {prompt}
              </p>
            </motion.div>
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
                  <div className="relative h-full max-h-[600px]">
                    <Image
                      alt="sketch drawing"
                      src={sketch}
                      className="h-full max-h-[600px] rounded-2xl border border-slate-900 shadow-card"
                      width={500}
                      height={600}
                    />
                    {saveLoading && imageModelType === SKETCH && (
                      <LoaderOverlay />
                    )}
                  </div>
                  <div className="flex justify-end p-1">
                    <IconButton
                      className="mr-2"
                      icon={<ArrowDownTrayIcon />}
                      onClick={() => downloadImage(sketch)}
                    />
                    <IconButton
                      icon={
                        <StarIcon
                          className={saveSketch ? "fill-yellow-500" : ""}
                        />
                      }
                      onClick={() => saveHandler(sketch, SKETCH)}
                      disabled={saveSketch}
                    />
                  </div>
                </motion.div>
              )}

              {!loading && generatedImage && !generateError && (
                <motion.div
                  key="33"
                  className="mt-4 flex h-full flex-col md:mt-0"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  variants={{
                    hidden: { opacity: 0, x: -50 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <div className="relative h-full max-h-[600px]">
                    <Image
                      alt="generated image"
                      src={generatedImage}
                      className="h-full rounded-2xl border border-slate-900 shadow-card"
                      width={500}
                      height={600}
                    />
                    {saveLoading && imageModelType === AI_IMAGE && (
                      <LoaderOverlay />
                    )}
                  </div>
                  <div className="flex justify-end p-1">
                    <IconButton
                      className="mr-2"
                      icon={<ArrowDownTrayIcon />}
                      onClick={() => downloadImage(generatedImage)}
                    />
                    <IconButton
                      icon={
                        <StarIcon
                          className={saveAiImage ? "fill-yellow-500" : ""}
                        />
                      }
                      onClick={() => saveHandler(generatedImage, AI_IMAGE)}
                      disabled={saveAiImage}
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
                onClick={resetHandler}
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
