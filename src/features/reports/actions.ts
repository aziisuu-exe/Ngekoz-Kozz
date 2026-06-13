"use server";

import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import { createReportSchema } from "./schemas";

export async function submitReportAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Anda harus login untuk dapat mengirim laporan." };
  }

  const data = Object.fromEntries(formData.entries());
  const validatedFields = createReportSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const { id_detail_kos, jenis_laporan, kategori, deskripsi } = validatedFields.data;
  const buktiFoto = formData.get("bukti_foto") as File | null;
  let finalBuktiUrl = null;

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (buktiFoto && buktiFoto.size > 0) {
      const fileNameStr = buktiFoto.name.toLowerCase();
      const validExtensions = ['.jpg', '.jpeg', '.png'];

      if (!validExtensions.some(ext => fileNameStr.endsWith(ext))) {
        return { error: "Format foto bukti ditolak. Harap unggah file berkstensi .JPG atau .PNG saja." };
      }

      if (buktiFoto.size > 3 * 1024 * 1024) {
        return { error: "Ukuran foto bukti terlalu besar. Maksimal adalah 3MB." };
      }

      const ext = fileNameStr.split('.').pop();
      const uniqueFileName = `report-${session.user.id}-${Date.now()}.${ext}`;

      const arrayBuffer = await buktiFoto.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from('report_evidences')
        .upload(uniqueFileName, buffer, {
          contentType: buktiFoto.type,
          upsert: true
        });

      if (uploadError) {
        console.error("Storage Error Bukti Laporan:", uploadError.message);
        return { error: `Gagal mengunggah foto bukti: ${uploadError.message}` };
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('report_evidences')
        .getPublicUrl(uniqueFileName);
        
      finalBuktiUrl = publicUrlData.publicUrl;
    }

    const { error: insertError } = await supabaseAdmin
      .from('laporan')
      .insert({
        id_user: session.user.id,
        id_detail_kos: Number(id_detail_kos),
        jenis_laporan,
        kategori,
        deskripsi,
        bukti_url: finalBuktiUrl,
        status_laporan: 'menunggu' 
      });

    if (insertError) {
      console.error("Gagal insert laporan:", insertError.message);
      return { error: "Terjadi kesalahan saat mengirim laporan ke database." };
    }

    return { success: true, message: "Laporan berhasil dikirim. Tim kami akan segera meninjaunya." };
  } catch (error) {
    console.error("Exception Submit Report:", error);
    return { error: "Terjadi kesalahan internal server." };
  }
}