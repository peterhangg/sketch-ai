import Head from "next/head";
import Canvas from "@/components/Canvas";

export default function Home() {
  return (
    <>
      <Head>
        <title>Sketch AI</title>
        <meta name="description" content="AI generated image from sketch" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen w-screen flex-col items-center  justify-center gap-5">
        <h1>Sketch AI</h1>
        <div>
          <Canvas width={800} height={600} />
        </div>
      </main>
    </>
  );
}
