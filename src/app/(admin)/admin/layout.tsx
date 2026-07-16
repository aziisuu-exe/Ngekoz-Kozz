import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "./_components/admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <AdminLayoutClient user={session.user}>
      {children}
    </AdminLayoutClient>
  );
}