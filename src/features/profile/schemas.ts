import { z } from "zod";

export const updateProfileSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  phone: z.string().optional().or(z.literal("")),
  bio: z.string().max(300, "Bio maksimal 300 karakter").optional().or(z.literal("")),
  kelamin: z.enum(["laki-laki", "Perempuan"]).optional().or(z.literal("")),
  pekerjaan: z.string().optional().or(z.literal("")),
  newPassword: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;