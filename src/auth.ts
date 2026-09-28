import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        if (!user.isActive) {
          return null;
        }

        const passwordValid = await verifyPassword(password, user.password);

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`,
          role: user.role,
        };
      },
    }),

    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Make sure every Google user exists in our own user table
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (!user.email) {
        return false;
      }

      const email = user.email.trim().toLowerCase();

      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (existing) {
        return existing.isActive;
      }

      const fullName = (user.name ?? email.split("@")[0]).trim();
      const [firstName, ...rest] = fullName.split(" ");

      await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email,
          firstName,
          lastName: rest.join(" ") || null,
          // Placeholder: Google users never log in with a password
          password: `google-oauth:${crypto.randomUUID()}`,
          updatedAt: new Date(),
        },
      });

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google" && user.email) {
          // Use OUR database id, not Google's
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email.trim().toLowerCase() },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } else {
          token.id = user.id;
          token.role = user.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.AUTH_SECRET,
});