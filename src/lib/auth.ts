import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { getServerSession } from "next-auth";
import { prisma } from "./prisma";
import { GetServerSessionContext } from "./types/nextauth";
import { config } from "../../config";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider(config.auth.google),
    DiscordProvider(config.auth.discord),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      const existingUser = await prisma.user.findFirst({
        where: { email: token.email },
      });

      if (!existingUser) {
        if (user) {
          token.id = user.id;
        }
        return token;
      }

      return {
        ...token,
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        picture: existingUser.image,
      };
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          name: token.name,
          email: token.email,
          image: token.picture,
        },
      };
    },
  },
  debug: process.env.NODE_ENV === "development",
};

/**
 * Wrapper for 'getServerSession' so that you don't need to import the 'authOptions' in every file.
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: GetServerSessionContext) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
