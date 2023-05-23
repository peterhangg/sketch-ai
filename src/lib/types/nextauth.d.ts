import type { DefaultSession } from "next-auth";
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { JWT } from "next-auth/jwt";
import { User } from ".";

declare module "next-auth" {
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

type GetServerSessionContext =
  | {
      req: GetServerSidePropsContext["req"];
      res: GetServerSidePropsContext["res"];
    }
  | { req: NextApiRequest; res: NextApiResponse };
