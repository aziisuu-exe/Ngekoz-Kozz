import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { createClient } from "@supabase/supabase-js" 
import bcrypt from "bcryptjs"
import { z } from "zod"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;

        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY! 
        );

        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !user || !user.password) {
          console.error("Login Error: User tidak ditemukan atau diblokir RLS", error);
          return null;
        }

        if (!user.is_verified) {
          throw new Error("Email belum diverifikasi. Silakan cek kotak masuk Anda.");
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
          console.error("Login Error: Password salah");
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.nama,
          role: user.role,
          image: user.profile_photo || null,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.picture = user.image;
      }
      if (trigger === "update" && session) {
        if (session.name) {
          token.name = session.name;
        }
        if (session.image !== undefined) {
          token.picture = session.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && token?.role) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'admin' | 'owner' | 'user';
        session.user.image = token.picture as string | null;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: '/login',
  }
})