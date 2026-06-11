"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "../schemas";
import { registerAction } from "../actions";
import { IconLoader2, IconBrandGoogle, IconMailForward } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5); 
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nama: "", email: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      router.push('/login');
    }
  }, [isSuccess, countdown, router]);

  const onSubmit = (data: RegisterInput) => {
    setErrorMsg(null);
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));

      const result = await registerAction(formData);
      
      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.success) {
        setIsSuccess(true); 
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-8 animate-in fade-in zoom-in duration-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600">
          <IconMailForward size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Cek Email Kamu!</h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Kami telah mengirimkan tautan verifikasi ke emailmu. Silakan klik tautan tersebut untuk mengaktifkan akun.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-lg px-6 py-4 w-full">
          <p className="text-sm font-medium text-gray-600">
            Mengarahkan ke halaman login dalam...
          </p>
          <span className="text-4xl font-black text-purple-600 tabular-nums">
            {countdown}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center md:items-start md:text-left mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Buat Akun Baru</h1>
        <p className="text-sm text-gray-500 mt-1">Daftar sekarang untuk mulai mencari kos idamanmu</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-sm border border-red-200 rounded-md font-medium">
            {errorMsg}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-900">Nama Lengkap</label>
          <input
            {...register("nama")}
            type="text"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={isPending}
          />
          {errors.nama && <p className="text-[0.8rem] font-medium text-red-500">{errors.nama.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-900">Email</label>
          <input
            {...register("email")}
            type="email"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={isPending}
          />
          {errors.email && <p className="text-[0.8rem] font-medium text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-900">Password</label>
          <input
            {...register("password")}
            type="password"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={isPending}
          />
          {errors.password && <p className="text-[0.8rem] font-medium text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-900">Konfirmasi Password</label>
          <input
            {...register("confirmPassword")}
            type="password"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={isPending}
          />
          {errors.confirmPassword && <p className="text-[0.8rem] font-medium text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-gray-900 text-white hover:bg-gray-800 h-10 px-4 py-2 w-full mt-2"
        >
          {isPending ? <><IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> Mendaftarkan...</> : "Daftar"}
        </button>
      </form>
    </div>
  );
}