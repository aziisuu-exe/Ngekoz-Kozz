"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "../schemas";
import { loginAction } from "../actions";
import { IconLoader2, IconBrandGoogle } from "@tabler/icons-react";
import Link from "next/link";

export function LoginForm() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginInput) => {
    setErrorMsg(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await loginAction(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center md:items-start md:text-left mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Selamat datang kembali</h1>
        <p className="text-sm text-gray-500 mt-1">
          Masukkan email dan password untuk masuk ke akunmu
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
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            disabled={isPending}
          />
          {errors.email && <p className="text-[0.8rem] font-medium text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none text-gray-900">Password</label>
            <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-800 transition-colors font-medium">
              Lupa password?
            </Link>
          </div>
          <input
            {...register("password")}
            type="password"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            disabled={isPending}
          />
          {errors.password && <p className="text-[0.8rem] font-medium text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-900 text-white hover:bg-gray-800 h-10 px-4 py-2 w-full mt-2"
        >
          {isPending ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Atau lanjutkan dengan</span>
        </div>
      </div>

      <button
        type="button"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 h-10 px-4 py-2 w-full"
      >
        <IconBrandGoogle className="mr-2 h-5 w-5 text-gray-600" />
        Login dengan Google
      </button>

      <div className="text-center text-sm text-gray-500">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-gray-900 hover:text-purple-700 transition-colors hover:underline">
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}