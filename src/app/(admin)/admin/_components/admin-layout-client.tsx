"use client";

import { useState } from "react";
import { AdminSidebar } from "./sidebar";
import { AdminHeader } from "./header";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: any;
}

export function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? "md:pl-64" : "pl-0"
        }`}
      >
        <AdminHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          sidebarOpen={sidebarOpen} 
          user={user} 
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}