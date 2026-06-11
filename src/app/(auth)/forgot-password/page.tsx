import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { IconHomeShield } from "@tabler/icons-react";
import Link from "next/link";

export const metadata = {
  title: "Lupa Password | Ngekoz",
  description: "Reset kata sandi akun Ngekoz Anda",
};

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-white">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 shadow-sm text-white">
              <IconHomeShield size={20} />
            </div>
            Ngekoz.
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>

      <div className="relative hidden bg-gray-900 lg:block">
        <img
          src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"
          alt="Ngekoz Premium Room"
          className="absolute inset-0 h-full w-full object-cover opacity-80 grayscale mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent" />
        
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h2 className="text-3xl font-bold mb-2">Keamanan Anda Prioritas Kami.</h2>
          <p className="text-gray-300">
            Kembalikan akses ke akunmu dengan mudah dan aman.
          </p>
        </div>
      </div>
    </div>
  );
}