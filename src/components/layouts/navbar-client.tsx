"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  IconMenu2, 
  IconX, 
  IconUser, 
  IconDashboard, 
  IconLogout, 
  IconCompass, 
  IconHelp, 
  IconBook 
} from "@tabler/icons-react";
import Image from "next/image";
import type { Session } from "next-auth";

interface NavbarClientProps {
  session: Session | null;
  logoutAction: () => Promise<void>;
}

export function NavbarClient({ session, logoutAction }: NavbarClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isLoggedIn = !!session?.user;
  const user = session?.user;

  const getDashboardLink = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "owner") return "/owner/dashboard";
    return "/reservasi/saya";
  };

  return (
    <>
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <Link href="/search" className="hover:text-purple-600 transition-colors flex items-center gap-1">
          <IconCompass size={16} />
          Pencarian Kos
        </Link>
        <Link href="#contact" className="hover:text-purple-600 transition-colors flex items-center gap-1">
          <IconHelp size={16} />
          Hubungi Kami
        </Link>
        <Link href="#guide" className="hover:text-purple-600 transition-colors flex items-center gap-1">
          <IconBook size={16} />
          Panduan
        </Link>
      </nav>

      <div className="hidden md:flex items-center gap-4">
        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100 border-2 border-purple-100 shadow-sm cursor-pointer hover:scale-105 transition-transform flex items-center justify-center text-gray-500">
                {user?.image ? (
                  <Image 
                    src={user.image} 
                    alt={user.name || "Profile"} 
                    fill 
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <IconUser size={24} stroke={1.5} />
                )}
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-xl bg-white p-2 shadow-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="px-3 py-2 border-b border-gray-50 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate capitalize">{user?.role} Platform</p>
                </div>
                
                <Link
                  href="/profile/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  <IconDashboard size={18} />
                  Dashboard Saya
                </Link>

                <button
                  onClick={async () => {
                    setIsProfileOpen(false);
                    await logoutAction();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <IconLogout size={18} />
                  Keluar Akun
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors px-3 py-2"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md text-sm font-semibold h-9 px-4 bg-gray-900 text-white hover:bg-purple-700 transition-colors shadow-sm"
            >
              Daftar
            </Link>
          </div>
        )}
      </div>

      <div className="flex md:hidden items-center">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-700 focus:outline-none p-1 rounded-md hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 p-6 flex flex-col gap-5 shadow-lg animate-in slide-in-from-top duration-300 z-40 md:hidden">
          <Link
            href="/search"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-medium text-gray-700 hover:text-purple-600 flex items-center gap-2"
          >
            <IconCompass size={20} />
            Pencarian Kos
          </Link>
          <Link
            href="#contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-medium text-gray-700 hover:text-purple-600 flex items-center gap-2"
          >
            <IconHelp size={20} />
            Hubungi Kami
          </Link>
          <Link
            href="#guide"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-medium text-gray-700 hover:text-purple-600 flex items-center gap-2"
          >
            <IconBook size={20} />
            Panduan
          </Link>
          
          <hr className="border-gray-100 my-1" />

          {isLoggedIn ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-xl">
                <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-purple-700 capitalize font-medium">{user?.role}</p>
                </div>
              </div>
              <Link
                href="/profile/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <IconDashboard size={18} />
                Dashboard Saya
              </Link>
              <button
                onClick={async () => {
                  setIsMobileMenuOpen(false);
                  await logoutAction();
                }}
                className="flex w-full items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600"
              >
                <IconLogout size={18} />
                Keluar Akun
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl text-sm font-semibold h-11 border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl text-sm font-semibold h-11 bg-gray-900 text-white hover:bg-purple-700"
              >
                Daftar Akun Baru
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}