import { z } from "zod";

const REPORT_CATEGORIES = [
  'penipuan', 
  'informasi_tidak_sesuai', 
  'foto_tidak_sesuai', 
  'kos_tidak_tersedia', 
  'perilaku_tidak_pantas', 
  'lainnya'
] as const;

const reportCategoryEnum = z.enum(REPORT_CATEGORIES, {
  message: "Silakan pilih kategori laporan" 
});

export const createReportSchema = z.object({
  id_detail_kos: z.string().or(z.number()),
  jenis_laporan: z.string()
    .min(5, "Judul laporan minimal 5 karakter")
    .max(100, "Judul laporan maksimal 100 karakter"),
  kategori: reportCategoryEnum,
  deskripsi: z.string()
    .min(15, "Jelaskan lebih detail (minimal 15 karakter)")
    .max(1000, "Deskripsi terlalu panjang"),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;