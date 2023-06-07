import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import { Header } from "../Header";
import { Footer } from "../Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Sketch AI</title>
        <meta
          name="description"
          content="Turn sketches into AI generated images"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col">
        {router.pathname !== "/auth/login" && <Header />}
        <main className="flex flex-1 justify-center p-3 antialiased">
          {children}
        </main>
        <Toaster />
        {router.pathname !== "/auth/login" && <Footer />}
      </div>
    </>
  );
}
