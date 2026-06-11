"use server";

import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { updateProfileSchema } from "./schemas";

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Akses ditolak. Silakan login kembali." };
  }

  const data = Object.fromEntries(formData.entries());
  const validatedFields = updateProfileSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Data tidak valid. Periksa kembali inputan Anda." };
  }

  const { nama, phone, bio, kelamin, pekerjaan, newPassword } = validatedFields.data;
  
  const profilePhoto = formData.get("profile_photo") as File | null;
  let photoUrl = undefined;

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (profilePhoto && profilePhoto.size > 0) {
      const fileNameStr = profilePhoto.name.toLowerCase();
      if (!fileNameStr.endsWith('.jpg') && !fileNameStr.endsWith('.jpeg')) {
        return { error: "Format foto ditolak. Harap unggah file .JPG atau .JPEG saja." };
      }

      const uniqueFileName = `${session.user.id}-${Date.now()}.jpg`;
      const arrayBuffer = await profilePhoto.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('profile_photos')
        .upload(uniqueFileName, buffer, { 
          contentType: profilePhoto.type,
          upsert: true 
        });

      if (uploadError) {
        console.error("Gagal upload foto:", uploadError);
        return { error: `Gagal mengunggah foto ke server: ${uploadError.message}` };
      }

      const { data: publicUrlData } = supabaseAdmin.storage.from('profile_photos').getPublicUrl(uniqueFileName);
      photoUrl = publicUrlData.publicUrl;
    }

    const updatePayload: any = { 
      nama,
      phone: phone || null,
      bio: bio || null,
      kelamin: kelamin || null,
      pekerjaan: pekerjaan || null,
    };

    if (photoUrl) {
      updatePayload.profile_photo = photoUrl;
    }

    if (newPassword && newPassword.length >= 6) {
      updatePayload.password = await bcrypt.hash(newPassword, 10);
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(updatePayload)
      .eq('id', session.user.id);

      if (updateError) {
        console.error("Detail Error DB:", updateError); 
        return { error: `Gagal menyimpan: ${updateError.message}` };
      }

    return { success: true, message: "Profil berhasil diperbarui!", newPhotoUrl: photoUrl };
  } catch (error) {
    console.error("Update Profile Exception:", error);
    return { error: "Terjadi kesalahan sistem." };
  }
}