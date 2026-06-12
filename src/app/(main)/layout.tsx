import { MainFooter } from "@/components/layouts/main-footer";
import { MainNavbar } from "@/components/layouts/main-navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainNavbar />
      <main className="flex-1 flex flex-col pt-20">
        {children}
      </main>
      <MainFooter />
    </>
  );
}