import React from "react";
import Head from "next/head";
import Image from "next/image";
import { useDrawStore } from "@/state/store";
import { Canvas } from "@/components/Canvas";
import { PromptForm } from "@/components/PromptForm";
import { Header } from "@/components/ui/Header";
import { Container } from "@/components/ui/Container";
import { Spinner } from "@/components/ui/Spinner";
import { Footer } from "@/components/ui/Footer";

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
          {!submitted ? (
            <>
              <h1 className="text-2xl">
                Turn your sketches into AI generated images
              </h1>
              <div className="mt-3 p-2">
                <Canvas />
                <PromptForm />
              </div>
            </>
          ) : (
            <>
              <h1 className="mb-10 text-2xl">AI Generated Image Results:</h1>
              <div className="container flex w-[80%] justify-around p-2">
                {sketch && (
                  <Image
                    alt="sketch"
                    src={sketch}
                    className="rounded-2xl border border-slate-900"
                    unoptimized={true}
                    width={475}
                    height={475}
                  />
                )}
                {loading && <Spinner />}
                {generatedImage && !loading && (
                  <Image
                    alt="generated image"
                    src={generatedImage}
                    className="rounded-2xl border border-slate-900"
                    width={475}
                    height={475}
                  />
                )}
              </div>
            </>
          )}
        </main>
        <Footer />
      </Container>
    </>
  );
}
