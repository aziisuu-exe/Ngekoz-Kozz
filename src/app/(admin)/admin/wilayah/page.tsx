import { 
  getWilayahStats, 
  getPaginatedProvinsi, 
  getPaginatedKota, 
  getPaginatedKecamatan,
  getAllProvinsiLists,
  getAllKotaLists
} from "@/features/admin/actions";
import Link from "next/link";
import { DeleteAction } from "../_components/delete-action";
import { WilayahFormModal } from "../_components/wilayah-form-modal";
import { IconMapPin, IconBuildingCommunity, IconMap, IconSearch, IconChevronLeft, IconChevronRight, IconPlus, IconPencil } from "@tabler/icons-react";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    page?: string;
    add?: string;
    edit?: string;
  }>;
}

export default async function AdminWilayahPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "provinsi";
  const currentSearch = resolvedParams.search || "";
  const currentPage = Number(resolvedParams.page) || 1;
  const isAdding = resolvedParams.add === "true";
  const editId = resolvedParams.edit || "";

  const stats = await getWilayahStats();

  let tableData: any[] = [];
  let totalPages = 0;
  let totalItems = 0;

  if (activeTab === "kecamatan") {
    const res = await getPaginatedKecamatan(currentSearch, currentPage, 10);
    tableData = res.data;
    totalPages = res.totalPages;
    totalItems = res.totalItems;
  } else if (activeTab === "kota") {
    const res = await getPaginatedKota(currentSearch, currentPage, 10);
    tableData = res.data;
    totalPages = res.totalPages;
    totalItems = res.totalItems;
  } else {
    const res = await getPaginatedProvinsi(currentSearch, currentPage, 10);
    tableData = res.data;
    totalPages = res.totalPages;
    totalItems = res.totalItems;
  }

  const selectedEditItem = editId ? tableData.find((item: any) => String(item.id) === String(editId)) : null;

  const [provinsiList, kotaList] = await Promise.all([
    activeTab === "kota" ? getAllProvinsiLists() : Promise.resolve([]),
    activeTab === "kecamatan" ? getAllKotaLists() : Promise.resolve([])
  ]);

  const cleanBaseParams = `tab=${activeTab}&search=${currentSearch}&page=${currentPage}`;
  const modalCloseUrl = `/admin/wilayah?${cleanBaseParams}`;

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Data Master Wilayah</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola data cakupan lokasi operasional platform Ngekoz</p>
        </div>

        <Link
          href={`/admin/wilayah?add=true&${cleanBaseParams}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-sm shrink-0"
        >
          <IconPlus size={16} strokeWidth={3} />
          Tambah {activeTab === "provinsi" ? "Provinsi" : activeTab === "kota" ? "Kota" : "Kecamatan"}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IconMap size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Provinsi</span>
            <span className="text-xl font-black text-gray-900 block mt-0.5">{stats.totalProvinsi} Wilayah</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IconBuildingCommunity size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Kota / Kabupaten</span>
            <span className="text-xl font-black text-gray-900 block mt-0.5">{stats.totalKota} Daerah</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IconMapPin size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Kecamatan</span>
            <span className="text-xl font-black text-gray-900 block mt-0.5">{stats.totalKecamatan} Sektor</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 border-b border-gray-100 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Link
            href={`/admin/wilayah?tab=provinsi${currentSearch ? `&search=${currentSearch}` : ""}`}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "provinsi"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Provinsi ({stats.totalProvinsi})
          </Link>
          <Link
            href={`/admin/wilayah?tab=kota${currentSearch ? `&search=${currentSearch}` : ""}`}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "kota"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Kota / Kabupaten ({stats.totalKota})
          </Link>
          <Link
            href={`/admin/wilayah?tab=kecamatan${currentSearch ? `&search=${currentSearch}` : ""}`}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "kecamatan"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Kecamatan ({stats.totalKecamatan})
          </Link>
        </div>

        <form method="GET" className="relative w-full sm:w-72 shrink-0">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={currentSearch}
            placeholder={`Cari nama ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 placeholder-gray-400"
          />
          <input type="hidden" name="tab" value={activeTab} />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6 w-32">ID Wilayah</th>
                <th className="py-4 px-6">Nama Wilayah</th>
                {activeTab === "kecamatan" && <th className="py-4 px-6">Kota Induk</th>}
                <th className="py-4 px-6 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "kecamatan" ? 4 : 3} className="py-12 text-center text-gray-400">
                    Tidak ada data wilayah yang ditemukan
                  </td>
                </tr>
              ) : (
                tableData.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-purple-600">
                      #{activeTab === "provinsi" ? "PRV" : activeTab === "kota" ? "KTA" : "KEC"}-{item.id}
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900">{item.nama}</td>
                    {activeTab === "kecamatan" && (
                      <td className="py-4 px-6 text-gray-600">{item.nama_kota}</td>
                    )}
                    <td className="py-4 px-6 text-right flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/wilayah?edit=${item.id}&${cleanBaseParams}`}
                        className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <IconPencil size={16} />
                      </Link>
                      <DeleteAction id={item.id} type={activeTab as any} />
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
                href={`/admin/wilayah?tab=${activeTab}&page=${currentPage - 1}${currentSearch ? `&search=${currentSearch}` : ""}`}
                className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors ${
                  currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
                }`}
              >
                <IconChevronLeft size={16} />
              </Link>
              <Link
                href={`/admin/wilayah?tab=${activeTab}&page=${currentPage + 1}${currentSearch ? `&search=${currentSearch}` : ""}`}
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

      {(isAdding || selectedEditItem) && (
        <WilayahFormModal 
          type={activeTab as any}
          editItem={selectedEditItem}
          provinsiList={provinsiList}
          kotaList={kotaList}
          closeUrl={modalCloseUrl}
        />
      )}

    </div>
  );
}