import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: 'admin' | 'owner' | 'user'
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: 'admin' | 'owner' | 'user'
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: 'admin' | 'owner' | 'user'
  }
}