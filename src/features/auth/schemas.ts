import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password wajib diisi"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"], 
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password wajib diisi"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;