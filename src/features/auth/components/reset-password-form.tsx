"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "../schemas";
import { resetPasswordAction } from "../actions";
import { IconLoader2, IconCircleCheck } from "@tabler/icons-react";
import Link from "next/link";

export function ResetPasswordForm({ token }: { token: string }) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    setErrorMsg(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);

      const result = await resetPasswordAction(formData, token);
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
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <IconCircleCheck size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Password Diperbarui!</h2>
          <p className="text-gray-500 text-sm">
            Kata sandi Anda berhasil diubah. Silakan masuk kembali menggunakan password baru Anda.
          </p>
        </div>
        <Link
          href="/login"
          className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-gray-900 text-white hover:bg-gray-800 h-10 mt-4"
        >
          Masuk Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center md:items-start md:text-left mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reset Password</h1>
        <p className="text-sm text-gray-500 mt-1">
          Masukkan kata sandi baru Anda di bawah ini.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-sm border border-red-200 rounded-md font-medium">
            {errorMsg}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-900">Password Baru</label>
          <input
            {...register("password")}
            type="password"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            disabled={isPending}
          />
          {errors.password && <p className="text-[0.8rem] font-medium text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-900">Konfirmasi Password Baru</label>
          <input
            {...register("confirmPassword")}
            type="password"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            disabled={isPending}
          />
          {errors.confirmPassword && <p className="text-[0.8rem] font-medium text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-gray-900 text-white hover:bg-gray-800 h-10 w-full mt-2"
        >
          {isPending ? <><IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</> : "Perbarui Password"}
        </button>
      </form>
    </div>
  );
}