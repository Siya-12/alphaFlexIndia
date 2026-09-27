// // src/auth.ts

// import NextAuth from "next-auth";
// import Credentials from "next-auth/providers/credentials";

// import { prisma } from "@/lib/prisma";
// import { verifyPassword } from "@/lib/auth/password";

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [
//     Credentials({
//       name: "Credentials",

//       credentials: {
//         email: {
//           label: "Email",
//           type: "email",
//         },

//         password: {
//           label: "Password",
//           type: "password",
//         },
//       },

//       async authorize(credentials) {
//         // ---------------------------------------------
//         // 1. Validate credentials
//         // ---------------------------------------------

//         if (
//           !credentials?.email ||
//           !credentials?.password
//         ) {
//           return null;
//         }

//         const email = String(credentials.email)
//           .trim()
//           .toLowerCase();

//         const password = String(credentials.password);

//         // ---------------------------------------------
//         // 2. Find user
//         // ---------------------------------------------

//         const user = await prisma.user.findUnique({
//           where: {
//             email,
//           },
//         });

//         // ---------------------------------------------
//         // 3. User doesn't exist
//         // ---------------------------------------------

//         if (!user) {
//           return null;
//         }

//         // ---------------------------------------------
//         // 4. Check account status
//         // ---------------------------------------------

//         if (!user.isActive) {
//           return null;
//         }

//         // ---------------------------------------------
//         // 5. Verify password
//         // ---------------------------------------------

//         const passwordValid = await verifyPassword(
//           password,
//           user.password
//         );

//         if (!passwordValid) {
//           return null;
//         }

//         // ---------------------------------------------
//         // 6. Return authenticated user
//         // ---------------------------------------------

//         return {
//           id: user.id,
//           email: user.email,
//           name: `${user.firstName}${
//             user.lastName
//               ? ` ${user.lastName}`
//               : ""
//           }`,
//           role: user.role,
//         };
//       },
//     }),
//   ],

//   session: {
//     strategy: "jwt",
//   },

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//       }

//       return token;
//     },

//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string;
//         session.user.role = token.role as string;
//       }

//       return session;
//     },
//   },

//   pages: {
//     signIn: "/login",
//   },

//   secret: process.env.AUTH_SECRET,
// });

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
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }

        const email = String(credentials.email)
          .trim()
          .toLowerCase();

        const password = String(credentials.password);

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          return null;
        }

        if (!user.isActive) {
          return null;
        }

        const passwordValid = await verifyPassword(
          password,
          user.password
        );

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName}${
            user.lastName
              ? ` ${user.lastName}`
              : ""
          }`,
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
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