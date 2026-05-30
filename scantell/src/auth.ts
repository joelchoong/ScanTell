import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// ⚠️ DEV ONLY — remove this block before going to production
const devBypassProvider = Credentials({
  id: "dev-bypass",
  name: "Dev Bypass",
  credentials: {},
  async authorize() {
    if (process.env.NODE_ENV === "production") return null;

    // Find or create a persistent dev test user in the DB
    const devUser = await prisma.user.upsert({
      where: { email: "dev@localhost" },
      update: {},
      create: {
        email: "dev@localhost",
        name: "Dev User",
        emailVerified: new Date(),
      },
    });

    return { id: devUser.id, email: devUser.email, name: devUser.name };
  },
});
// ⚠️ END DEV ONLY

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials provider requires JWT strategy
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    // ⚠️ DEV ONLY — remove before production
    ...(process.env.NODE_ENV !== "production" ? [devBypassProvider] : []),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
    error: "/auth-error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
