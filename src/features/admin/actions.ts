import { createClient } from "@supabase/supabase-js";

export async function getDashboardStats() {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  
    const [
      { count: totalUsers },
      { count: totalKos },
      { data: revenueData },
      { count: successReservations },
      { count: totalReservations },
      { data: visitsData, error: visitsError } 
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('detail_kos').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('reservasi').select('created_at, biaya_admin').eq('status', 'paid'),
      supabaseAdmin.from('reservasi').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
      supabaseAdmin.from('reservasi').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('page_views') 
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
    ]);
  
    const totalPendapatan = revenueData?.reduce((acc, curr) => acc + (curr.biaya_admin || 0), 0) || 0;
    const successRate = totalReservations && totalReservations > 0 
      ? Math.round(((successReservations || 0) / totalReservations) * 100) 
      : 0;
  
    return {
      totalUsers: totalUsers || 0,
      totalKos: totalKos || 0,
      totalPendapatan,
      successRate,
      revenueData: revenueData || [],
      visitsData: visitsData || [], 
    };
  }