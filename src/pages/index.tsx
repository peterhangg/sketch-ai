import React from "react";
import Head from "next/head";
import Image from "next/image";
import Canvas from "@/components/Canvas";
import { useDrawStore } from "@/state/store";
import PromptForm from "@/components/PromptForm";
import { Spinner } from "@/components/ui/Spinner";

export default function Home() {
  const store = useDrawStore((state) => state);
  const { sketch, generatedImage, submitted, loading } = store;

  return (
    <>
      <Head>
        <title>Sketch AI</title>
        <meta name="description" content="AI generated image from sketch" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen w-screen flex-col items-center justify-center gap-5">
        <h1>Sketch AI</h1>
        <div>
          <Canvas width={800} height={600} />
          <PromptForm />
        </div>
        <div className="flex w-[80%] justify-center p-2">
          <div className="flex basis-2/4 items-center justify-center">
            {sketch && submitted && (
              <Image
                alt="sketch"
                src={sketch}
                className="rounded-2xl p-2"
                width={475}
                height={475}
              />
            )}
          </div>
          <div className="flex basis-2/4 items-center justify-center">
            {loading && <Spinner />}
            {generatedImage && !loading && (
              <Image
                alt="generated image"
                src={generatedImage}
                className="rounded-2xl p-2"
                width={475}
                height={475}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
