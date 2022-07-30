import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "configurations";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOpts: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    // ...add more providers here
  ],
  adapter: PrismaAdapter(prisma),
};
export default NextAuth(authOpts);
