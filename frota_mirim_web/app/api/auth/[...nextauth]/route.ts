import CredentialsProvider from "next-auth/providers/credentials";
import { AuthUser } from "../../../../services/auth.service";
import type { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";
import axios from "axios";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        try {
          const response = await axios.post(
            // "http://localhost:3333/auth/login",
            "https://frota-mirim-api.vercel.app/auth/login",
            {
              email: credentials?.email,
              password: credentials?.password,
            }
          );

          const { user, accessToken } = response.data;

          return {
            ...user,
            accessToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: AuthUser }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken as string;

      if (session.user) {
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
