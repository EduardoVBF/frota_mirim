import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;

    user: {
      role: string;
      firstName?: string;
      lastName?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
    email: string;
    firstName: string;
    lastName: string;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    role: string;
    firstName?: string;
    lastName?: string;
  }
}
