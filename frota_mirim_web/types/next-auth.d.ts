import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;

    user: {
      role: string;
      firstName?: string;
      lastName?: string;
      imageUrl?: string;
      cnhExpiresAt?: Date;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    email: string;
    firstName: string;
    lastName: string;
    accessToken: string;
    imageUrl?: string;
    cnhExpiresAt?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    role: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    cnhExpiresAt?: Date;
  }
}
