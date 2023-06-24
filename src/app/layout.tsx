import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { MobileNotSupported } from "@/components/layout/MobileNotSupported";
import NextAuthProvider from "@/components/layout/NextAuthProvider";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Sketch AI",
  description: "Turn sketches into AI generated images",
  keywords: [
    "Next.js",
    "React",
    "Tailwind CSS",
    "Server Components",
    "Server Actions",
    "Sketch",
    "AI",
  ],
  authors: [
    {
      name: "peterhangg",
      url: "https://github.com/peterhangg",
    },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sketch-ai-gpt.vercel.app",
    title: "Sketch AI",
    description: "Turn sketches into AI generated images",
    siteName: "Sketch AI",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn("flex min-h-screen antialiased")}
        suppressHydrationWarning={true}
      >
        <NextAuthProvider>
          <MobileNotSupported>{children}</MobileNotSupported>
        </NextAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
