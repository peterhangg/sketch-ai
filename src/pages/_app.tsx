import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { type Session } from "next-auth";
import { Layout } from "@/components/layout/Layout";
import { MobileNotSupported } from "@/components/layout/MobileNotSupported";
import "@/styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session | null }>) {
  return (
    <SessionProvider session={session}>
      <Layout>
        <MobileNotSupported>
          <Component {...pageProps} />
        </MobileNotSupported>
      </Layout>
    </SessionProvider>
  );
}
