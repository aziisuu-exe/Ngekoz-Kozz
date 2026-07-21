import { z } from "zod";

export const kamarSchema = z.object({
  id_detail_kos: z.coerce.number().min(1, "Harap pilih properti kos"),
  nomor_kamar: z.string().min(1, "Nomor atau tipe kamar wajib diisi (misal: Deluxe A1 / Standard)"),
  price_per_month: z.coerce.number().min(10000, "Harga sewa bulanan minimal Rp 10.000"),
  price_per_day: z.coerce.number().optional().default(0),
  total_kamar: z.coerce.number().min(1, "Total stok kamar minimal 1 unit"),
  kamar_tersedia: z.coerce.number().min(0, "Jumlah kamar tersedia tidak boleh negatif"),
  ukuran: z.string().optional().default("3x3 m"),
  deskripsi: z.string().optional().default(""),
  is_available: z.boolean().default(true),
});

export type KamarInput = z.infer<typeof kamarSchema>;