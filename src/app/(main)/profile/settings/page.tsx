"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileInput } from "@/features/profile/schemas";
import { updateProfileAction, getUserProfile } from "@/features/profile/actions"; // 👈 Pastikan getUserProfile di-import
import { useSession } from "next-auth/react";
import { IconUser, IconLoader2, IconShieldCheck, IconAlertTriangle } from "@tabler/icons-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfileSettingsPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGenderLocked, setIsGenderLocked] = useState<boolean>(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      nama: "",
      phone: "",
      pekerjaan: "",
      kelamin: "",
      bio: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    async function fetchProfileData() {
      if (session?.user) {
        reset({
          nama: session.user.name || "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      if (session?.user?.id) {
        const result = await getUserProfile();
        if (result.success && result.data) {
          if (result.data.kelamin) {
            setIsGenderLocked(true);
          }
          reset({
            nama: result.data.nama || session.user.name || "",
            phone: result.data.phone || "",       
            pekerjaan: result.data.pekerjaan || "",
            kelamin: result.data.kelamin || "",     
            bio: result.data.bio || "",
            newPassword: "",
            confirmPassword: "",
          });
        }
      }
    }

    fetchProfileData();
  }, [session?.user?.id, reset]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const onSubmit = (data: UpdateProfileInput) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    
    startTransition(async () => {
      const formElement = document.getElementById("profileForm") as HTMLFormElement;
      const formData = new FormData(formElement); 

      if (data.kelamin) formData.set("kelamin", data.kelamin);

      const result = await updateProfileAction(formData);
      
      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.success) {
        setSuccessMsg(result.message || "Berhasil diperbarui");
        
        const sessionUpdate: any = { name: data.nama };
        if (result.newPhotoUrl) sessionUpdate.image = result.newPhotoUrl;
        await updateSession(sessionUpdate);
        router.refresh();
      }
    });
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <IconLoader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 mb-8">
        
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="relative h-16 w-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-purple-200">
            {session.user.image ? (
               <Image src={session.user.image} alt="Profile" fill className="object-cover" />
            ) : (
               <IconUser size={32} />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Profil</h1>
            <p className="text-sm text-gray-500">Lengkapi data diri untuk pengalaman mencari kos yang lebih baik.</p>
          </div>
        </div>

        <form id="profileForm" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {errorMsg && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">{errorMsg}</div>}
          {successMsg && <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-100">{successMsg}</div>}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Umum</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Unggah Foto Profil (.JPG)</label>
                <input
                  type="file"
                  name="profile_photo" 
                  accept=".jpg,.jpeg"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all cursor-pointer border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Terkunci)</label>
                <input type="email" disabled value={session.user.email || ""} className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input {...register("nama")} type="text" className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none" />
                {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                <input {...register("phone")} type="tel" placeholder="Contoh: 08123456789" className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
                <input {...register("pekerjaan")} type="text" placeholder="Contoh: Mahasiswa, Karyawan" className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kelamin {isGenderLocked && "(Terkunci)"}
                </label>
                <Controller
                  control={control}
                  name="kelamin"
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                      disabled={isGenderLocked} 
                    >
                      <SelectTrigger 
                        className={`w-full h-11 px-4 rounded-xl border border-gray-300 outline-none transition-all ${
                          isGenderLocked 
                            ? "bg-gray-50 text-gray-500 cursor-not-allowed opacity-90" 
                            : "bg-white shadow-sm focus:ring-2 focus:ring-purple-600 text-gray-700"
                        }`}
                      >
                        <SelectValue placeholder="Pilih Kelamin" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-100 shadow-xl bg-white">
                        <SelectItem value="laki-laki" className="rounded-lg cursor-pointer hover:bg-purple-50 text-gray-700 font-medium">Laki - laki</SelectItem>
                        <SelectItem value="perempuan" className="rounded-lg cursor-pointer hover:bg-purple-50 text-gray-700 font-medium">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio Singkat</label>
                <textarea {...register("bio")} rows={3} placeholder="Ceritakan sedikit tentang dirimu..." className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none resize-none"></textarea>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-1">
              <IconShieldCheck size={20} className="text-green-600" /> Keamanan Akun
            </h3>
            <p className="text-sm text-gray-500 mb-4">Kosongkan jika Anda tidak ingin mengubah password.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <input {...register("newPassword")} type="password" placeholder="Minimal 6 karakter" className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none" />
                {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                <input {...register("confirmPassword")} type="password" placeholder="Ulangi password" className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none" />
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isPending} className="flex items-center justify-center px-8 py-3 bg-gray-900 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
              {isPending ? <><IconLoader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}