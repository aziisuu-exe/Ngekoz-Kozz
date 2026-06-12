import Link from "next/link";
import { auth, signOut } from "@/auth";
import { IconHomeShield } from "@tabler/icons-react";
import { NavbarClient } from "./navbar-client";

export async function MainNavbar() {
  const session = await auth();
  const logoutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 shadow-sm text-white">
              <IconHomeShield size={20} />
            </div>
            Ngekoz.
          </Link>
        </div>

        <NavbarClient session={session} logoutAction={logoutAction} />

      </div>
    </header>
  );
}