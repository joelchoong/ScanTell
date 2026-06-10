import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/shared/server/db";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";
import { getUserFromCache, setUserInCache } from "@/lib/sessionCache";

const emailPasswordProvider = Credentials({
  id: "email-password",
  name: "Email & Password",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) return null;

    const user = await prisma.user.findUnique({
      where: { email: credentials.email as string },
    });

    if (!user?.password) return null;

    const isValid = await bcrypt.compare(
      credentials.password as string,
      user.password
    );

    if (!isValid) return null;

    return { id: user.id, email: user.email, name: user.name };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
    emailPasswordProvider,
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
        
        // Try to get user data from cache first
        const cachedUser = getUserFromCache(token.id as string);
        
        if (cachedUser) {
          session.user.name = cachedUser.name;
          session.user.email = cachedUser.email;
        } else {
          // Fetch from database and cache the result
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { name: true, email: true },
          });
          
          if (dbUser) {
            session.user.name = dbUser.name;
            session.user.email = dbUser.email;
            setUserInCache(token.id as string, {
              name: dbUser.name,
              email: dbUser.email,
            });
          }
        }
      }
      return session;
    },
  },
});
