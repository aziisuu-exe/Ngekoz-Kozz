import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

interface ViewCounterProps {
  url: string;
}

export async function ViewCounter({ url }: ViewCounterProps) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? Number(session.user.id) : null;

    console.log(`[Tracker] Mencoba mencatat kunjungan untuk URL: ${url} (User ID: ${userId})`);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0); 

    if (userId) {
      const { data: existingViews } = await supabase
        .from("page_views")
        .select("id")
        .eq("page_url", url)
        .eq("user_id", userId)
        .gte("created_at", hariIni.toISOString())
        .limit(1); 

      if (existingViews && existingViews.length > 0) {
        console.log(`[Tracker] User ${userId} sudah berkunjung hari ini ke ${url}. Insert dibatalkan.`);
        return null;
      }
    }

    const { error: insertError } = await supabase
      .from("page_views")
      .insert({
        page_url: url,
        user_id: userId, 
      });

    if (insertError) {
      console.error("[Tracker] Supabase Insert Error:", insertError.message);
    } else {
      console.log(`[Tracker] Sukses memasukkan log kunjungan ke database untuk: ${url}`);
    }

  } catch (error) {
    console.error("[Tracker] Fatal Catch Error:", error);
  }

  return null;
}