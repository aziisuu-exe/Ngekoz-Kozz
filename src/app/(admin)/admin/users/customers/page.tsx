import { getPaginatedUsers } from "@/features/admin/actions";
import Link from "next/link";
import { UserActions } from "./_components/user-actions";
import { IconChevronLeft, IconChevronRight, IconSearch, IconUsers, IconUser, IconCheck, IconX, IconPhone, IconMail, IconCalendar, IconEye, IconBriefcase, IconGenderMale, IconId } from "@tabler/icons-react";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    show?: string;
  }>;
}

export default async function AdminKelolaPencariPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentSearch = resolvedParams.search || "";
  const currentPage = Number(resolvedParams.page) || 1;
  const showDetailId = resolvedParams.show || "";

  const { data = [], totalPages = 0, totalItems = 0 } = await getPaginatedUsers(
    "user",
    currentSearch,
    currentPage,
    10
  );

  const selectedUser = showDetailId ? data.find((u: any) => String(u.id) === String(showDetailId)) : null;
  const cleanParamsString = `search=${currentSearch}&page=${currentPage}`;

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 relative">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kelola Pencari Kos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total akun penyewa aktif: {totalItems} pengguna</p>
        </div>

        <form method="GET" className="relative w-full sm:w-72">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={currentSearch}
            placeholder="Cari nama pencari..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 placeholder-gray-400"
          />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6 w-20">Foto</th>
                <th className="py-4 px-6">Nama Penghuni</th>
                <th className="py-4 px-6">Email Akun</th>
                <th className="py-4 px-6">No. Telepon</th>
                <th className="py-4 px-6">Verifikasi</th>
                <th className="py-4 px-6">Status Akun</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <IconUsers size={28} className="text-gray-300" />
                      <span>Tidak ada data pencari kos yang ditemukan</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-4 px-6">
                      {user.profile_photo ? (
                        <img 
                          src={user.profile_photo} 
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-gray-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                          <IconUser size={18} />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900">{user.name}</td>
                    <td className="py-4 px-6 text-gray-600">{user.email}</td>
                    <td className="py-4 px-6 font-medium text-gray-700">{user.phone}</td>
                    <td className="py-4 px-6">
                      {user.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-green-50 text-green-700 border border-green-200">
                          <IconCheck size={12} strokeWidth={3} />
                          Terverifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-gray-50 text-gray-500 border border-gray-200">
                          <IconX size={12} strokeWidth={3} />
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-md ${
                        user.is_active 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {user.is_active ? "AKTIF" : "SUSPENDED"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/users/customers?show=${user.id}&${cleanParamsString}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        <IconEye size={14} />
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/users/customers?page=${currentPage - 1}${currentSearch ? `&search=${currentSearch}` : ""}`}
                className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors ${
                  currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
                }`}
              >
                <IconChevronLeft size={16} />
              </Link>
              <Link
                href={`/admin/users/customers?page=${currentPage + 1}${currentSearch ? `&search=${currentSearch}` : ""}`}
                className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors ${
                  currentPage >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
                }`}
              >
                <IconChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <h3 className="text-base font-bold text-gray-900">Profil Lengkap Penghuni</h3>
              <Link 
                href={`/admin/users/customers?${cleanParamsString}`}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                <IconX size={18} />
              </Link>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              {selectedUser.profile_photo ? (
                <img 
                  src={selectedUser.profile_photo} 
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-100 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border-2 border-purple-100 text-2xl font-bold">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-lg font-bold text-gray-900">{selectedUser.name}</h4>
                <span className="text-xs text-purple-600 font-semibold uppercase tracking-wider bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100 block w-max mx-auto mt-1.5">
                  Pencari Kos
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Bio / Catatan</span>
              <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed italic">
                "{selectedUser.bio}"
              </p>
            </div>

            <div className="bg-gray-50/60 rounded-xl border border-gray-100 p-4 space-y-3 text-xs">
              <div className="flex items-center gap-3 text-gray-600">
                <IconMail size={16} className="text-gray-400 shrink-0" />
                <span className="truncate">{selectedUser.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <IconPhone size={16} className="text-gray-400 shrink-0" />
                <span>{selectedUser.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <IconGenderMale size={16} className="text-gray-400 shrink-0" />
                <span>Gender: <strong className="text-gray-900 font-semibold">{selectedUser.kelamin}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <IconBriefcase size={16} className="text-gray-400 shrink-0" />
                <span>Pekerjaan: <strong className="text-gray-900 font-semibold">{selectedUser.pekerjaan}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <IconCalendar size={16} className="text-gray-400 shrink-0" />
                <span>Bergabung: {new Date(selectedUser.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-100 p-3 rounded-xl text-center shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Reservasi</span>
                <span className="text-xl font-black text-gray-900 block mt-0.5">{selectedUser.count}x</span>
              </div>
              <div className="bg-white border border-gray-100 p-3 rounded-xl text-center shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Status Validasi</span>
                <span className={`text-xs font-bold block mt-2 px-2 py-0.5 rounded-md border w-max mx-auto uppercase ${
                  selectedUser.is_verified 
                    ? "bg-green-50 text-green-700 border-green-100" 
                    : "bg-gray-50 text-gray-500 border-gray-200"
                }`}>
                  {selectedUser.is_verified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Otoritas Manajemen Akun</span>
              <UserActions 
                userId={selectedUser.id} 
                isActive={selectedUser.is_active} 
                searchParamsString={cleanParamsString} 
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}