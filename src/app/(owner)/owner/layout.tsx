import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OwnerSidebar } from "./_components/owner-sidebar";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    redirect("/");
  }

  const displayName = session.user?.name || (session.user as any)?.nama || "Mitra Owner";
  const userImage = session.user?.image || (session.user as any)?.profile_photo || (session.user as any)?.picture || null;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      <OwnerSidebar />
      
      <div className="flex-1 flex flex-col min-h-screen md:pl-64">
        <header className="h-16 border-b border-gray-100 bg-white px-6 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            PANEL OWNER KOS
          </span>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-sm font-bold text-gray-900 leading-tight">{displayName}</span>
              <span className="block text-[10px] font-bold text-purple-600 uppercase tracking-wider">Property Owner</span>
            </div>

            {userImage ? (
              <img
                src={userImage}
                alt={displayName}
                className="h-9 w-9 rounded-full object-cover border border-purple-100 shadow-xs"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                {initial}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}