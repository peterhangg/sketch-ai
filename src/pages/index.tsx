import React from "react";
import Head from "next/head";
import Image from "next/image";
import Canvas from "@/components/Canvas";
import { useDrawStore } from "@/state/store";

export default function Home() {
  const store = useDrawStore((state) => state);
  const {
    prompt,
    sketch,
    generatedImage,
    setGeneratedImage,
    loading,
    setLoading,
    error,
    setError,
    submitted,
    setSubmitted,
  } = store;

  const generatePhoto = async (imageUrl: string, prompt: string) => {
    try {
      const res = await fetch("/api/prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl, prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data);
        return;
      }

      setGeneratedImage(data);
    } catch (reason) {
      setError({ message: "unexpected error try again" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setSubmitted(true);
    generatePhoto(sketch, prompt);
  };

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
          <form className="my-3 flex p-4" onSubmit={handleSubmit}>
            <input
              type="text"
              className="flex-1 rounded-l-md border border-gray-300 px-4 py-2"
              placeholder="Describe the image you want to create..."
              name="prompt"
              onChange={(e) => store.setPrompt(e.target.value)}
              value={prompt}
            />
            <button
              className="rounded-r-md bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
              disabled={!prompt}
            >
              Submit
            </button>
          </form>
        </div>
        <div className="flex p-2">
          {sketch && submitted && (
            <Image
              alt="sketch"
              src={sketch}
              className="rounded-2xl p-2"
              width={475}
              height={475}
            />
          )}
          {generatedImage && (
            <Image
              alt="generated image"
              src={generatedImage}
              className="rounded-2xl p-2"
              width={475}
              height={475}
            />
          )}
        </div>
      </main>
    </>
  );
}
