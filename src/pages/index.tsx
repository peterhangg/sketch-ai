import React from "react";
import Head from "next/head";
import Image from "next/image";
import { Canvas } from "@/components/Canvas";
import { Spinner } from "@/components/ui/Spinner";
import { PromptForm } from "@/components/PromptForm";
import { Header } from "@/components/ui/Header";
import { Container } from "@/components/ui/Container";
import { useDrawStore } from "@/state/store";

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
      <Container>
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center">
          <h1 className="text-2xl">
            Turn your sketches into AI generated images
          </h1>
          <div className="mt-3 p-2">
            <Canvas />
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
      </Container>
    </>
  );
}
