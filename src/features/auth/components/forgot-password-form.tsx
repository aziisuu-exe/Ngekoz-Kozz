"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../schemas";
import { forgotPasswordAction } from "../actions";
import { IconLoader2, IconMailCheck } from "@tabler/icons-react";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    setErrorMsg(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);

      const result = await forgotPasswordAction(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.success) {
        setIsSuccess(true);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-6 animate-in fade-in duration-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600">
          <IconMailCheck size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Periksa Email Anda</h2>
          <p className="text-gray-500 text-sm">
            Jika email tersebut terdaftar di sistem kami, kami telah mengirimkan tautan untuk mengatur ulang kata sandi Anda.
          </p>
        </div>
        <Link
          href="/login"
          className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-gray-900 text-white hover:bg-gray-800 h-10 mt-4"
        >
          Kembali ke Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center md:items-start md:text-left mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Lupa Password?</h1>
        <p className="text-sm text-gray-500 mt-1">
          Masukkan email Anda dan kami akan mengirimkan tautan untuk mereset kata sandi.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-sm border border-red-200 rounded-md font-medium">
            {errorMsg}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-900">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="nama@email.com"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={isPending}
          />
          {errors.email && <p className="text-[0.8rem] font-medium text-red-500">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-gray-900 text-white hover:bg-gray-800 h-10 w-full mt-2"
        >
          {isPending ? <><IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...</> : "Kirim Tautan Reset"}
        </button>
      </form>

      <div className="text-center text-sm text-gray-500">
        Ingat password Anda?{" "}
        <Link href="/login" className="font-semibold text-gray-900 hover:text-purple-700 hover:underline">
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}