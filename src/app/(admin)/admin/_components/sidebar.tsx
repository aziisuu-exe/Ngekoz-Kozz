"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogout } from "@/features/admin/actions";
import { 
  IconLayoutDashboard, 
  IconClockShield, 
  IconHomeHeart, 
  IconUserCheck, 
  IconUsers, 
  IconReceipt, 
  IconSettings,
  IconHomeShield,
  IconLogout,
  IconX,
  IconFileRss,
  IconReportAnalytics
} from "@tabler/icons-react";

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: "Utama",
      items: [
        { name: "Dashboard", href: "/admin/dashboard", icon: IconLayoutDashboard },
      ],
    },
    {
      title: "Manajemen Properti",
      items: [
        { name: "Moderasi Kos", href: "/admin/kos/moderasi", icon: IconClockShield },
        { name: "Daftar Kos", href: "/admin/kos/list", icon: IconHomeHeart },
        { name: "Fasilitas & Aturan", href: "/admin/fasilitas-aturan", icon: IconFileRss },
        { name: "Laporan Pengaduan", href: "/admin/laporan", icon: IconReportAnalytics },
      ],
    },
    {
      title: "Pengguna",
      items: [
        { name: "Kelola Owner", href: "/admin/users/owners", icon: IconUserCheck },
        { name: "Kelola Pengguna", href: "/admin/users/customers", icon: IconUsers },
      ],
    },
    {
      title: "Finansial",
      items: [
        { name: "Transaksi", href: "/admin/transactions", icon: IconReceipt },
      ],
    },
    {
      title: "Sistem",
      items: [
        { name: "Kelola Wilayah", href: "/admin/wilayah", icon: IconHomeShield },
        { name: "Pengaturan", href: "/admin/settings", icon: IconSettings },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 flex flex-col h-screen z-50 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 shadow-sm text-white">
              <IconHomeShield size={20} />
            </div>
            Ngekoz.
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 md:hidden transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1.5">
              <h4 className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {group.title}
              </h4>
              <ul className="space-y-0.5">
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                  return (
                    <li key={itemIndex}>
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
          ))}
        </div>

        <div className="p-4 border-t border-gray-50 mt-auto">
          <form action={adminLogout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black text-red-600 hover:bg-red-50 transition-all group text-left cursor-pointer tracking-wider"
            >
              <IconLogout 
                size={20} 
                className="text-red-600 transition-colors" 
              />
              KELUAR
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}