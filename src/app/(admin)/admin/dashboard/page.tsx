import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { IconUsers, IconHomeHeart, IconWallet, IconChecklist, IconCoins } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "../_components/revenue-chart";
import { VisitsChart } from "../_components/visits-chart";
import { ModerationQueue } from "../_components/moderation-queue";
import { getDashboardStats } from "@/features/admin/actions"; 
import { TopProperties } from "../_components/top-properties";
import { formatRupiah } from "@/lib/utils"; 

export const metadata = { title: "Admin Dashboard | Ngekoz" };

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/");

  const stats = await getDashboardStats(); 

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Overview <span className="text-gray-400 font-normal mx-2">|</span> <span className="text-purple-600 font-semibold">Dashboard Analytics</span>
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pengguna</CardTitle>
            <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <IconUsers size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Properti</CardTitle>
            <div className="h-8 w-8 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
              <IconHomeHeart size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalKos}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pendapatan Bersih</CardTitle>
            <div className="h-8 w-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <IconWallet size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatRupiah(stats.totalPendapatan)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Payouts</CardTitle>
            <div className="h-8 w-8 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
              <IconCoins size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatRupiah(stats.totalPendingPayout)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Reservasi Sukses</CardTitle>
            <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <IconChecklist size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.successRate}%</div>
          </CardContent>
        </Card>

      </div>

      <div className="grid gap-4 lg:grid-cols-2 mt-8">
        <RevenueChart rawData={stats.revenueData} />
        <VisitsChart rawData={stats.visitsData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        <ModerationQueue data={stats.pendingKos} />
        <TopProperties data={stats.topProperties} />
      </div>
      
    </div>
  );
}