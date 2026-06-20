import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const headersList = req.headers;
    
    const callbackToken = headersList.get("x-callback-token");
    if (callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      console.warn("Unauthorized Webhook Request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { external_id, status, id: xendit_invoice_id, payment_method, bank_code } = payload;
    
    console.log(`Menangkap Webhook Xendit: Invoice ${external_id} berstatus ${status}`);

    const { data: paymentData, error: findError } = await supabaseAdmin
      .from('payment')
      .select('id, id_reservasi')
      .eq('external_id', external_id)
      .single();

    if (findError || !paymentData) {
      console.error("Data Payment tidak ditemukan di Database:", external_id);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const newStatus = status === "PAID" ? "paid" : status === "EXPIRED" ? "expired" : "pending";
    const isPaid = status === "PAID";

    await supabaseAdmin
      .from('payment')
      .update({
        status: newStatus,
        payment_method: payment_method || null,
        bank_code: bank_code || null,
        paid_at: isPaid ? new Date().toISOString() : null, 
      })
      .eq('id', paymentData.id);

    if (newStatus === "paid" || newStatus === "expired") {
      await supabaseAdmin
        .from('reservasi')
        .update({ status: newStatus })
        .eq('id', paymentData.id_reservasi);
        
    }

    await supabaseAdmin
      .from('payment_callback')
      .insert({
        id_payment: paymentData.id,
        callback_type: "INVOICE",
        payload: payload,
        headers: Object.fromEntries(headersList.entries()),
        is_verified: true
      });

    return NextResponse.json({ success: true, message: "Webhook processed successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Exception in Xendit Webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}