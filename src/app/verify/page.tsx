import { createClient } from "@supabase/supabase-js";
import { IconCheck, IconX, IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";

interface VerifyPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return <VerificationResult status="error" message="Token verifikasi tidak ditemukan." />;
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, is_verified, token_expires_at')
      .eq('verification_token', token)
      .single();

    if (userError || !user) {
      return <VerificationResult status="error" message="Token verifikasi tidak valid atau pengguna tidak ditemukan." />;
    }

    if (user.is_verified) {
      return <VerificationResult status="success" message="Email Anda sudah terverifikasi sebelumnya!" />;
    }

    const now = new Date();
    const expiresAt = new Date(user.token_expires_at);
    if (now > expiresAt) {
      return <VerificationResult status="error" message="Tautan verifikasi sudah kedaluwarsa. Silakan daftar ulang atau minta tautan baru." />;
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        is_verified: true,
        verification_token: null,
        token_expires_at: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error("Gagal update status verifikasi:", updateError);
      return <VerificationResult status="error" message="Terjadi kesalahan saat memverifikasi akun Anda." />;
    }

    return <VerificationResult status="success" message="Email Anda berhasil diverifikasi!" />;

  } catch (error) {
    console.error("Verification Exception:", error);
    return <VerificationResult status="error" message="Terjadi kesalahan pada server." />;
  }
}

function VerificationResult({ status, message }: { status: 'success' | 'error', message: string }) {
  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center animate-in zoom-in duration-300">
        
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-6 ${
          isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {isSuccess ? <IconCheck size={40} /> : <IconX size={40} />}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isSuccess ? 'Verifikasi Berhasil!' : 'Verifikasi Gagal'}
        </h1>
        <p className="text-gray-500 mb-8">
          {message}
        </p>

        {isSuccess ? (
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium transition-colors bg-gray-900 text-white hover:bg-gray-800 h-11 px-4"
          >
            Lanjut ke Halaman Login
          </Link>
        ) : (
          <Link
            href="/register"
            className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium transition-colors border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-11 px-4"
          >
            Kembali ke Pendaftaran
          </Link>
        )}
      </div>
    </div>
  );
}