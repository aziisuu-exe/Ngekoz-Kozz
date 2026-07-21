import { z } from "zod";
export const JENIS_KOS_VALUES = ["putra", "putri", "campur"] as const;

export const insertKosSchema = z.object({
  nama_kos: z.string().min(4, "Nama properti kos minimal 4 karakter"),
  deskripsi: z.string().min(15, "Deskripsi detail kos minimal 15 karakter"),
  alamat: z.string().min(5, "Alamat lengkap operasional wajib diisi"),
  id_kecamatan: z.coerce.number().min(1, "Harap pilih wilayah kecamatan dengan benar"),
  jenis_kos: z.enum(JENIS_KOS_VALUES, {
    message: "Harap tentukan klasifikasi jenis kategori kos yang valid",
  }),
  latitude: z.coerce.number({ error: "Latitude harus berupa angka koordinat" }),
  longitude: z.coerce.number({ error: "Longitude harus berupa angka koordinat" }),
  fasilitasIds: z.array(z.number()).default([]),
  aturanIds: z.array(z.number()).default([]),
  fotoUrls: z.array(z.string()).min(1, "Minimal wajib mengunggah 1 foto properti utama"),
});

export type InsertKosInput = z.infer<typeof insertKosSchema>;
export type JenisKos = (typeof JENIS_KOS_VALUES)[number];