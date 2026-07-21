"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogout } from "@/features/admin/actions";
import { 
  IconLayoutDashboard, 
  IconBuildingStore, 
  IconBed, 
  IconCalendarCheck, 
  IconWallet,
  IconLogout,
  IconHomeShield
} from "@tabler/icons-react";

export function OwnerSidebar() {
  const pathname = usePathname();

  const menus = [
    { name: "Dashboard Analytics", href: "/owner/dashboard", icon: IconLayoutDashboard },
    { name: "Kelola Properti Kos", href: "/owner/kos", icon: IconBuildingStore },
    { name: "Stok & Tipe Kamar", href: "/owner/kamar", icon: IconBed },
    { name: "Reservasi Masuk", href: "/owner/reservasi", icon: IconCalendarCheck },
    { name: "Laporan Keuangan", href: "/owner/keuangan", icon: IconWallet },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 flex flex-col h-screen z-50 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-gray-50">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 shadow-sm text-white">
            <IconHomeShield size={20} />
          </div>
          Ngekoz.
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-6">
        <ul className="space-y-1">
          {menus.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/owner/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-purple-50 text-purple-600 font-semibold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon 
                    size={20} 
                    className={`transition-colors ${
                      isActive ? "text-purple-600" : "text-gray-400 group-hover:text-gray-600"
                    }`} 
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-50 mt-auto">
        <form action={adminLogout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black text-red-600 hover:bg-red-50 transition-all group text-left cursor-pointer tracking-wider"
          >
            <IconLogout size={20} className="text-red-600 transition-colors" />
            KELUAR
          </button>
        </form>
      </div>
    </aside>
  );
}