import * as TablerIcons from "@tabler/icons-react";
import { 
  IconArmchair, 
  IconListCheck, 
  IconSearch, 
  IconChevronLeft, 
  IconChevronRight, 
  IconPlus, 
  IconPencil 
} from "@tabler/icons-react";
import { 
  getFasilitasAturanStats, 
  getPaginatedFasilitas, 
  getPaginatedAturan 
} from "@/features/admin/actions";
import Link from "next/link";
import { DeleteAction } from "./_components/delete-action";
import { FeatureFormModal } from "./_components/feature-form-modal";
  
  interface PageProps {
    searchParams: Promise<{
      tab?: string;
      search?: string;
      page?: string;
      add?: string;
      edit?: string;
    }>;
  }
  
  export default async function AdminFasilitasAturanPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const activeTab = resolvedParams.tab || "fasilitas";
    const currentSearch = resolvedParams.search || "";
    const currentPage = Number(resolvedParams.page) || 1;
    const intentAdd = resolvedParams.add === "true";
    const editId = resolvedParams.edit || "";
  
    const stats = await getFasilitasAturanStats();
  
    let tableData: any[] = [];
    let totalPages = 0;
    let totalItems = 0;
  
    if (activeTab === "aturan") {
      const res = await getPaginatedAturan(currentSearch, currentPage, 10);
      tableData = res.data;
      totalPages = res.totalPages;
      totalItems = res.totalItems;
    } else {
      const res = await getPaginatedFasilitas(currentSearch, currentPage, 10);
      tableData = res.data;
      totalPages = res.totalPages;
      totalItems = res.totalItems;
    }
  
    const selectedEditItem = editId ? tableData.find((item: any) => String(item.id) === String(editId)) : null;
  
    const cleanBaseParams = `tab=${activeTab}&search=${currentSearch}&page=${currentPage}`;
    const modalCloseUrl = `/admin/fasilitas-aturan?${cleanBaseParams}`;
  
    return (
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Karakteristik & Fitur Properti</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kelola daftar fasilitas baku dan regulasi aturan platform Ngekoz</p>
          </div>
  
          <Link
            href={`/admin/fasilitas-aturan?add=true&${cleanBaseParams}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-sm shrink-0"
          >
            <IconPlus size={16} strokeWidth={3} />
            Tambah {activeTab === "fasilitas" ? "Fasilitas" : "Aturan"}
          </Link>
        </div>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <IconArmchair size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Total Fasilitas</span>
              <span className="text-xl font-black text-gray-900 block mt-0.5">{stats.totalFasilitas} Jenis</span>
            </div>
          </div>
  
          <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IconListCheck size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Total Regulasi Aturan</span>
              <span className="text-xl font-black text-gray-900 block mt-0.5">{stats.totalAturan} Klausa</span>
            </div>
          </div>
        </div>
  
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 border-b border-gray-100 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Link
              href={`/admin/fasilitas-aturan?tab=fasilitas${currentSearch ? `&search=${currentSearch}` : ""}`}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "fasilitas"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Daftar Fasilitas ({stats.totalFasilitas})
            </Link>
            <Link
              href={`/admin/fasilitas-aturan?tab=aturan${currentSearch ? `&search=${currentSearch}` : ""}`}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "aturan"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Daftar Aturan ({stats.totalAturan})
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
                  <th className="py-4 px-6 w-32">ID Fitur</th>
                  {activeTab === "fasilitas" && <th className="py-4 px-6 w-20 text-center">Visual</th>}
                  <th className="py-4 px-6">Deskripsi Karakteristik</th>
                  <th className="py-4 px-6 text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === "fasilitas" ? 4 : 3} className="py-12 text-center text-gray-400">
                      Tidak ada data master fitur yang ditemukan
                    </td>
                  </tr>
                ) : (
                  tableData.map((item: any) => {
                    let DynamicIcon = TablerIcons.IconArmchair;
                    if (activeTab === "fasilitas" && item.icon && (TablerIcons as any)[item.icon]) {
                      DynamicIcon = (TablerIcons as any)[item.icon];
                    }
  
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs text-purple-600">
                          #{activeTab === "fasilitas" ? "FSL" : "ATR"}-{item.id}
                        </td>
                        {activeTab === "fasilitas" && (
                          <td className="py-4 px-6 text-center">
                            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
                              <DynamicIcon size={16} />
                            </div>
                          </td>
                        )}
                        <td className="py-4 px-6 font-semibold text-gray-900">{item.nama}</td>
                        <td className="py-4 px-6 text-right flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/fasilitas-aturan?edit=${item.id}&${cleanBaseParams}`}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                          >
                            <IconPencil size={16} />
                          </Link>
                          <DeleteAction id={item.id} type={activeTab as any} />
                        </td>
                      </tr>
                    );
                  })
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
                  href={`/admin/fasilitas-aturan?tab=${activeTab}&page=${currentPage - 1}${currentSearch ? `&search=${currentSearch}` : ""}`}
                  className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors ${
                    currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
                  }`}
                >
                  <IconChevronLeft size={16} />
                </Link>
                <Link
                  href={`/admin/fasilitas-aturan?tab=${activeTab}&page=${currentPage + 1}${currentSearch ? `&search=${currentSearch}` : ""}`}
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
  
        {(intentAdd || selectedEditItem) && (
          <FeatureFormModal 
            type={activeTab as any}
            editItem={selectedEditItem}
            closeUrl={modalCloseUrl}
          />
        )}
  
      </div>
    );
  }