import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export default async function TestDBPage() {
  // Inisialisasi Supabase Server Client
  const supabase = await createClient();

  // Test query ke tabel provinsi
  const { data, error } = await supabase.from('provinsi').select('*');

  return (
    <div className="p-10 font-sans max-w-2xl mx-auto mt-10 border rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🔌 Supabase Connection Test
      </h1>
      
      {error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
          <h3 className="text-red-800 font-bold">❌ Koneksi Gagal!</h3>
          <p className="text-red-600 mt-1">{error.message}</p>
          <p className="text-sm text-gray-500 mt-2">
            Cek kembali file .env.local kamu. Pastikan URL dan ANON_KEY sudah benar.
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md">
          <h3 className="text-green-800 font-bold">✅ Koneksi Berhasil!</h3>
          <p className="text-green-600 mt-1 mb-4">
            Next.js berhasil mengambil data dari PostgreSQL.
          </p>
          
          <div className="bg-slate-900 rounded-md p-4 overflow-x-auto">
            <code className="text-green-400 text-sm">
              {JSON.stringify(data, null, 2)}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}