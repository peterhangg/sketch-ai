import React from "react";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { Header } from "../ui/Header";
import { Footer } from "../ui/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
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
      <main className="flex h-screen min-h-screen w-screen flex-col">
        <Header />
        <main className="flex-1 p-4 antialiased">{children}</main>
        <Toaster />
        <Footer />
      </main>
    </>
  );
}
