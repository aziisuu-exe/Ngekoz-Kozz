"use client";

import { useEffect, useState } from "react";
import { IconMenu2 } from "@tabler/icons-react";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  user: any;
}

export function AdminHeader({ onToggleSidebar, sidebarOpen, user }: AdminHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    setMounted(true);
    const updateClock = () => {
      const now = new Date();
      const formatOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setTimeString(now.toLocaleDateString("id-ID", formatOptions).replace(/\./g, ":"));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const displayName = user?.name || user?.nama || user?.full_name || "Admin";
  const userImage = user?.image || user?.picture || user?.profile_photo || user?.avatar_url || null;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 border-b border-gray-100 bg-white sticky top-0 z-20 w-full">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <IconMenu2 size={20} />
          </button>
          {mounted && (
            <span className="text-xs text-gray-400 font-semibold hidden sm:inline-block">
              Waktu Server: {timeString}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-sm font-bold text-gray-900 leading-tight">
              {displayName}
            </span>
            <span className="block text-[10px] font-semibold text-purple-600 uppercase tracking-wider">
              Admin
            </span>
          </div>
          
          {userImage ? (
            <img
              src={userImage}
              alt={displayName}
              className="h-9 w-9 rounded-full object-cover border border-purple-100 shadow-xs"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 font-bold text-sm">
              {initial}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}