"use server";

import { createClient } from "@supabase/supabase-js"; 
import { auth, signOut } from "@/auth";
import { revalidatePath } from "next/cache";

async function verifyAdminSession() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized access");
  }
  return session;
}

export async function adminLogout() {
  await signOut({ redirectTo: "/" });
}

export async function getDashboardStats() { 
    const supabaseAdmin = createClient( 
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    const [ 
      { count: totalUsers }, 
      { count: totalKos }, 
      { data: allReservations }, 
      { data: visitsData }, 
      { data: pendingKos }, 
      { data: allKosNames } 
    ] = await Promise.all([ 
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }), 
      supabaseAdmin.from('detail_kos').select('*', { count: 'exact', head: true }), 
      supabaseAdmin.from('reservasi').select('created_at, biaya_admin, harga_sewa, status'),
      supabaseAdmin 
        .from('page_views') 
        .select('created_at, page_url') 
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()), 
      supabaseAdmin 
        .from('detail_kos') 
        .select('id, nama_kos, created_at') 
        .eq('approval_status', 'pending') 
        .order('created_at', { ascending: false }) 
        .limit(5), 
      supabaseAdmin.from('detail_kos').select('id, nama_kos') 
    ]);

    const totalReservations = allReservations?.length || 0;
    const revenueData = allReservations?.filter(r => r.status === 'paid' || r.status === 'completed') || [];
    const totalPendapatan = revenueData.reduce((acc, curr) => acc + (Number(curr.biaya_admin) || 0), 0);
    const successReservations = revenueData.length;
    const successRate = totalReservations > 0 ? Math.round((successReservations / totalReservations) * 100) : 0; 
    
    const totalPendingPayout = allReservations
      ?.filter(r => r.status === 'paid')
      .reduce((acc, curr) => acc + (Number(curr.harga_sewa) || 0), 0) || 0;

    const kosViews = visitsData?.filter(v => v.page_url?.startsWith('/kos/')) || []; 
    const viewCounts: Record<string, number> = {};
    kosViews.forEach(v => { 
      viewCounts[v.page_url] = (viewCounts[v.page_url] || 0) + 1; 
    });

    const topProperties = Object.entries(viewCounts) 
      .sort((a, b) => b[1] - a[1]) 
      .slice(0, 5) 
      .map(([url, count]) => { 
        const matchedKos = allKosNames?.find(k => url.includes(String(k.id))); 
        return { 
          nama_kos: matchedKos ? matchedKos.nama_kos : url.replace('/kos/', '').replace(/-/g, ' '), 
          views: count 
        }; 
      });

    return { 
      totalUsers: totalUsers || 0, 
      totalKos: totalKos || 0, 
      totalPendapatan, 
      totalPendingPayout, 
      successRate,
      revenueData,
      visitsData: visitsData || [], 
      pendingKos: pendingKos || [], 
      topProperties, 
    }; 
}

export async function getPaginatedKos(
  status?: "pending" | "approved" | "rejected",
  search?: string,
  page: number = 1,
  pageSize: number = 10
) {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from("detail_kos")
    .select("*, kamar_kos(price_per_month)", { count: "exact" });

  if (status) {
    query = query.eq("approval_status", status);
  }

  if (search) {
    query = query.ilike("nama_kos", `%${search}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const mappedData = (data || []).map((kos: any) => {
    const userKey = Object.keys(kos).find((k) =>
      ["id_user", "user_id", "owner_id", "id_owner"].includes(k)
    );
    const userIdVal = userKey ? kos[userKey] : null;

    const prices = (kos.kamar_kos || [])
      .map((kamar: any) => Number(kamar.price_per_month))
      .filter((p: number) => !isNaN(p));
    const hargaBulananTerendah = prices.length > 0 ? Math.min(...prices) : 0;

    return {
      id: kos.id,
      nama_kos: kos.nama_kos,
      alamat: kos.alamat,
      harga_bulanan: hargaBulananTerendah,
      is_active: kos.is_active,
      approval_status: kos.approval_status,
      created_at: kos.created_at,
      _userId: userIdVal,
    };
  });

  const userIds = Array.from(new Set(mappedData.map((d) => d._userId).filter(Boolean)));
  
  let usersData: any[] = [];
  if (userIds.length > 0) {
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("id, name")
      .in("id", userIds);
    
    if (users) {
      usersData = users;
    }
  }

  const finalData = mappedData.map((d) => {
    const matchedUser = usersData.find((u) => String(u.id) === String(d._userId));
    return {
      id: d.id,
      nama_kos: d.nama_kos,
      alamat: d.alamat,
      harga_bulanan: d.harga_bulanan,
      is_active: d.is_active,
      approval_status: d.approval_status,
      created_at: d.created_at,
      users: matchedUser ? { name: matchedUser.name } : null,
    };
  });

  return {
    data: finalData,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
    totalItems: count || 0,
  };
}

export async function updateKosApproval(
  kosId: number | string, 
  status: "approved" | "rejected"
) {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const isActiveStatus = status === "approved";

  const { error } = await supabaseAdmin
    .from("detail_kos")
    .update({ 
      approval_status: status,
      is_active: isActiveStatus
    })
    .eq("id", kosId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/kos/moderasi");
  revalidatePath("/admin/kos/list");
  
  return { success: true };
}

export async function toggleKosActive(kosId: number | string, currentStatus: boolean) {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from("detail_kos")
    .update({ is_active: !currentStatus })
    .eq("id", kosId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/kos/list");
  
  return { success: true };
}

export async function getKosById(kosId: number | string) {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: kos, error } = await supabaseAdmin
    .from("detail_kos")
    .select("*, kamar_kos(*)")
    .eq("id", kosId)
    .single();

  if (error || !kos) {
    return null;
  }

  const userKey = Object.keys(kos).find((k) =>
    ["id_user", "user_id", "owner_id", "id_owner"].includes(k)
  );
  const userIdVal = userKey ? kos[userKey] : null;

  let ownerName = "-";
  if (userIdVal) {
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userIdVal)
      .single();

    if (user) {
      ownerName = user.nama || user.name || user.full_name || "Pemilik Tanpa Nama";
    }
  }

  return {
    ...kos,
    owner_name: ownerName
  };
}

export async function getPaginatedTransactions(
  status?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10
) {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from("reservasi")
    .select("id, created_at, biaya_admin, harga_sewa, status, id_user, id_detail_kos", { count: "exact" });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const userIds = Array.from(new Set((data || []).map((r: any) => r.id_user).filter(Boolean)));
  const kosIds = Array.from(new Set((data || []).map((r: any) => r.id_detail_kos).filter(Boolean)));

  let usersData: any[] = [];
  if (userIds.length > 0) {
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("*")
      .in("id", userIds);
    if (users) usersData = users;
  }

  let kosData: any[] = [];
  if (kosIds.length > 0) {
    const { data: kos } = await supabaseAdmin
      .from("detail_kos")
      .select("id, nama_kos")
      .in("id", kosIds);
    if (kos) kosData = kos;
  }

  const mappedData = (data || []).map((res: any) => {
    const matchedUser = usersData.find((u) => String(u.id) === String(res.id_user));
    const matchedKos = kosData.find((k) => String(k.id) === String(res.id_detail_kos));
    
    const finalUserName = matchedUser 
      ? (matchedUser.nama || matchedUser.name || matchedUser.full_name || "Pengguna")
      : "Pengguna Tidak Dikenal";

    const totalMembayar = (Number(res.harga_sewa) || 0) + (Number(res.biaya_admin) || 0);

    const matchSearch = search 
      ? finalUserName.toLowerCase().includes(search.toLowerCase()) || 
        matchedKos?.nama_kos?.toLowerCase().includes(search.toLowerCase())
      : true;

    if (!matchSearch) return null;

    return {
      id: res.id,
      created_at: res.created_at,
      biaya_admin: Number(res.biaya_admin) || 0,
      harga_sewa: Number(res.harga_sewa) || 0,
      total: totalMembayar,
      status: res.status,
      pencari: finalUserName,
      nama_kos: matchedKos ? matchedKos.nama_kos : "Properti Telah Dihapus"
    };
  }).filter(Boolean);

  return {
    data: mappedData,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
    totalItems: count || 0
  };
}

export async function getPaginatedUsers(
  role: "user" | "owner",
  search?: string,
  page: number = 1,
  pageSize: number = 10
) {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from("users")
    .select("*", { count: "exact" })
    .eq("role", role);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const userIds = (data || []).map((u: any) => u.id);
  const additionalData: Record<string, number> = {};

  if (userIds.length > 0) {
    if (role === "user") {
      const { data: sampleRes } = await supabaseAdmin.from("reservasi").select("*").limit(1);
      let resUserKey = "id_user";
      if (sampleRes && sampleRes.length > 0) {
        resUserKey = Object.keys(sampleRes[0]).find((k) =>
          ["id_user", "user_id", "pencari_id", "id_pencari"].includes(k)
        ) || "id_user";
      }

      const { data: resData } = await supabaseAdmin
        .from("reservasi")
        .select(`id, ${resUserKey}`)
        .in(resUserKey, userIds);
      
      (resData || []).forEach((r: any) => {
        const uid = r[resUserKey];
        additionalData[uid] = (additionalData[uid] || 0) + 1;
      });
    } else {
      const { data: sampleKos } = await supabaseAdmin.from("detail_kos").select("*").limit(1);
      let kosOwnerKey = "id_user";
      if (sampleKos && sampleKos.length > 0) {
        kosOwnerKey = Object.keys(sampleKos[0]).find((k) =>
          ["id_user", "user_id", "owner_id", "id_owner"].includes(k)
        ) || "id_user";
      }

      const { data: kosData } = await supabaseAdmin
        .from("detail_kos")
        .select(`id, ${kosOwnerKey}`)
        .in(kosOwnerKey, userIds);
      
      (kosData || []).forEach((k: any) => {
        const ownerId = k[kosOwnerKey];
        additionalData[ownerId] = (additionalData[ownerId] || 0) + 1;
      });
    }
  }

  const mappedData = (data || []).map((u: any) => {
    const finalName = u.name || u.nama || u.full_name || "Tanpa Nama";
    
    const accountStateKey = Object.keys(u).find((k) =>
      ["is_active", "active", "status", "is_suspended", "banned", "blocked", "is_blocked"].includes(k)
    );
    
    let accountActiveStatus = true;
    if (accountStateKey === "is_suspended" || accountStateKey === "banned" || accountStateKey === "blocked" || accountStateKey === "is_blocked") {
      accountActiveStatus = !u[accountStateKey];
    } else if (accountStateKey === "status") {
      accountActiveStatus = String(u[accountStateKey]).toLowerCase() === "active" || String(u[accountStateKey]).toLowerCase() === "true";
    } else if (accountStateKey) {
      accountActiveStatus = !!u[accountStateKey];
    }

    return {
      id: u.id,
      name: finalName,
      email: u.email || "-",
      created_at: u.created_at,
      count: additionalData[u.id] || 0,
      profile_photo: u.profile_photo || u.avatar_url || u.image || null,
      phone: u.phone || u.no_hp || u.telepon || "-",
      is_verified: u.is_verified ?? u.verified ?? false,
      bio: u.bio || u.deskripsi || u.about || "Tidak ada bio.",
      kelamin: u.kelamin || u.gender || u.jenis_kelamin || "-",
      pekerjaan: u.pekerjaan || u.occupation || u.job || "-",
      is_active: accountActiveStatus
    };
  });

  return {
    data: mappedData,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
    totalItems: count || 0
  };
}

export async function toggleUserActive(userId: number | string, currentStatus: boolean) {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: user, error: fetchError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchError || !user) {
    throw new Error("Pengguna tidak ditemukan");
  }

  const accountStateKey = Object.keys(user).find((k) =>
    ["is_active", "active", "status", "is_suspended", "banned", "blocked", "is_blocked"].includes(k)
  ) || "is_active";

  let updateValue: any = !currentStatus;
  if (accountStateKey === "is_suspended" || accountStateKey === "banned" || accountStateKey === "blocked" || accountStateKey === "is_blocked") {
    updateValue = currentStatus;
  } else if (accountStateKey === "status") {
    updateValue = !currentStatus ? "active" : "suspended";
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update({ [accountStateKey]: updateValue })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users/customers");
  revalidatePath("/admin/users/owners");
  
  return { success: true };
}

export async function deleteUserAccount(userId: number | string) {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users/customers");
  return { success: true };
}

export async function getWilayahStats() {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const [{ count: totalProvinsi }, { count: totalKota }, { count: totalKecamatan }] = await Promise.all([
    supabaseAdmin.from("provinsi").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("kota").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("kecamatan").select("*", { count: "exact", head: true })
  ]);
  
  return {
    totalProvinsi: totalProvinsi || 0,
    totalKota: totalKota || 0,
    totalKecamatan: totalKecamatan || 0
  };
}

export async function getPaginatedKota(search?: string, page: number = 1, pageSize: number = 10) {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: sample } = await supabaseAdmin.from("kota").select("*").limit(1);
  let nameKey = "nama";
  if (sample && sample.length > 0) {
    nameKey = Object.keys(sample[0]).find(k => ["nama", "name", "nama_kota", "nama_kabupaten"].includes(k)) || "nama";
  }

  let query = supabaseAdmin.from("kota").select("*", { count: "exact" });
  if (search) {
    query = query.ilike(nameKey, `%${search}%`);
  }

  const { data, count, error } = await query.order(nameKey, { ascending: true }).range(from, to);
  if (error) throw new Error(error.message);

  const mappedData = (data || []).map((item: any) => ({
    id: item.id,
    nama: item[nameKey] || "-",
    id_provinsi: item.id_provinsi || item.provinsi_id || null
  }));

  return { 
    data: mappedData, 
    totalPages: count ? Math.ceil(count / pageSize) : 0, 
    totalItems: count || 0 
  };
}

export async function getPaginatedKecamatan(search?: string, page: number = 1, pageSize: number = 10) {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: sample } = await supabaseAdmin.from("kecamatan").select("*").limit(1);
  let nameKey = "nama";
  if (sample && sample.length > 0) {
    nameKey = Object.keys(sample[0]).find(k => ["nama", "name", "nama_kecamatan"].includes(k)) || "nama";
  }

  let query = supabaseAdmin.from("kecamatan").select("*", { count: "exact" });
  if (search) {
    query = query.ilike(nameKey, `%${search}%`);
  }

  const { data, count, error } = await query.order(nameKey, { ascending: true }).range(from, to);
  if (error) throw new Error(error.message);

  const kotaIds = Array.from(new Set((data || []).map((k: any) => k.id_kota || k.kota_id).filter(Boolean)));
  let kotaMap: Record<string, string> = {};
  if (kotaIds.length > 0) {
    const { data: kotaData } = await supabaseAdmin.from("kota").select("*").in("id", kotaIds);
    (kotaData || []).forEach((kt: any) => {
      const ktNameKey = Object.keys(kt).find(k => ["nama", "name", "nama_kota"].includes(k)) || "nama";
      kotaMap[kt.id] = kt[ktNameKey];
    });
  }

  const mappedData = (data || []).map((item: any) => {
    const kid = item.id_kota || item.kota_id || null;
    return {
      id: item.id,
      nama: item[nameKey] || "-",
      nama_kota: kotaMap[kid] || "-"
    };
  });

  return { 
    data: mappedData, 
    totalPages: count ? Math.ceil(count / pageSize) : 0, 
    totalItems: count || 0 
  };
}

export async function getPaginatedProvinsi(search?: string, page: number = 1, pageSize: number = 10) {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: sample } = await supabaseAdmin.from("provinsi").select("*").limit(1);
  let nameKey = "nama";
  if (sample && sample.length > 0) {
    nameKey = Object.keys(sample[0]).find(k => ["nama", "name", "nama_provinsi"].includes(k)) || "nama";
  }

  let query = supabaseAdmin.from("provinsi").select("*", { count: "exact" });
  if (search) {
    query = query.ilike(nameKey, `%${search}%`);
  }

  const { data, count, error } = await query.order(nameKey, { ascending: true }).range(from, to);
  if (error) throw new Error(error.message);

  const mappedData = (data || []).map((item: any) => ({
    id: item.id,
    nama: item[nameKey] || "-"
  }));

  return {
    data: mappedData,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
    totalItems: count || 0
  };
}

export async function getAllProvinsiLists() {
  await verifyAdminSession();
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data: sample } = await supabaseAdmin.from("provinsi").select("*").limit(1);
  let nameKey = "nama";
  if (sample && sample.length > 0) {
    nameKey = Object.keys(sample[0]).find(k => ["nama", "name", "nama_provinsi"].includes(k)) || "nama";
  }

  const { data } = await supabaseAdmin.from("provinsi").select(`id, ${nameKey}`).order(nameKey, { ascending: true });
  return (data || []).map((d: any) => ({ id: d.id, nama: d[nameKey] }));
}

export async function getAllKotaLists() {
  await verifyAdminSession();
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data: sample } = await supabaseAdmin.from("kota").select("*").limit(1);
  let nameKey = "nama";
  if (sample && sample.length > 0) {
    nameKey = Object.keys(sample[0]).find(k => ["nama", "name", "nama_kota"].includes(k)) || "nama";
  }

  const { data } = await supabaseAdmin.from("kota").select(`id, ${nameKey}`).order(nameKey, { ascending: true });
  return (data || []).map((d: any) => ({ id: d.id, nama: d[nameKey] }));
}

export async function upsertProvinsi(id: string | number | null, nama: string) {
  await verifyAdminSession();
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data: sample } = await supabaseAdmin.from("provinsi").select("*").limit(1);
  let nameKey = "nama";
  if (sample && sample.length > 0) {
    nameKey = Object.keys(sample[0]).find(k => ["nama", "name", "nama_provinsi"].includes(k)) || "nama";
  }

  let error;
  if (id) {
    const { error: err } = await supabaseAdmin.from("provinsi").update({ [nameKey]: nama }).eq("id", id);
    error = err;
  } else {
    const { error: err } = await supabaseAdmin.from("provinsi").insert([{ [nameKey]: nama }]);
    error = err;
  }

  if (error) throw new Error(error.message);
  revalidatePath("/admin/wilayah");
  return { success: true };
}

export async function deleteProvinsi(id: string | number) {
  await verifyAdminSession();
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabaseAdmin.from("provinsi").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/wilayah");
  return { success: true };
}

export async function upsertKota(id: string | number | null, nama: string, idProvinsi: string | number) {
  await verifyAdminSession();
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data: sample } = await supabaseAdmin.from("kota").select("*").limit(1);
  let nameKey = "nama";
  let provKey = "id_provinsi";
  if (sample && sample.length > 0) {
    nameKey = Object.keys(sample[0]).find(k => ["nama", "name", "nama_kota"].includes(k)) || "nama";
    provKey = Object.keys(sample[0]).find(k => ["id_provinsi", "provinsi_id"].includes(k)) || "id_provinsi";
  }

  let error;
  const payload = { [nameKey]: nama, [provKey]: Number(idProvinsi) };
  if (id) {
    const { error: err } = await supabaseAdmin.from("kota").update(payload).eq("id", id);
    error = err;
  } else {
    const { error: err } = await supabaseAdmin.from("kota").insert([payload]);
    error = err;
  }

  if (error) throw new Error(error.message);
  revalidatePath("/admin/wilayah");
  return { success: true };
}

export async function deleteKota(id: string | number) {
  await verifyAdminSession();
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabaseAdmin.from("kota").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/wilayah");
  return { success: true };
}

export async function upsertKecamatan(id: string | number | null, nama: string, idKota: string | number) {
  await verifyAdminSession();
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data: sample } = await supabaseAdmin.from("kecamatan").select("*").limit(1);
  let nameKey = "nama";
  let kotaKey = "id_kota";
  if (sample && sample.length > 0) {
    nameKey = Object.keys(sample[0]).find(k => ["nama", "name", "nama_kecamatan"].includes(k)) || "nama";
    kotaKey = Object.keys(sample[0]).find(k => ["id_kota", "kota_id"].includes(k)) || "id_kota";
  }

  let error;
  const payload = { [nameKey]: nama, [kotaKey]: Number(idKota) };
  if (id) {
    const { error: err } = await supabaseAdmin.from("kecamatan").update(payload).eq("id", id);
    error = err;
  } else {
    const { error: err } = await supabaseAdmin.from("kecamatan").insert([payload]);
    error = err;
  }

  if (error) throw new Error(error.message);
  revalidatePath("/admin/wilayah");
  return { success: true };
}

export async function deleteKecamatan(id: string | number) {
  await verifyAdminSession();
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabaseAdmin.from("kecamatan").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/wilayah");
  return { success: true };
}

export async function getFasilitasAturanStats() {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [{ count: totalFasilitas }, { count: totalAturan }] = await Promise.all([
    supabaseAdmin.from("fasilitas").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("aturan").select("*", { count: "exact", head: true })
  ]);

  return {
    totalFasilitas: totalFasilitas || 0,
    totalAturan: totalAturan || 0
  };
}

export async function getPaginatedFasilitas(search?: string, page: number = 1, pageSize: number = 10) {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: sample } = await supabaseAdmin.from("fasilitas").select("*").limit(1);
  let nameKey = "nama";
  if (sample && sample.length > 0) {
    nameKey = Object.keys(sample[0]).find(k => ["nama", "name", "nama_fasilitas"].includes(k)) || "nama";
  }

  let query = supabaseAdmin.from("fasilitas").select("*", { count: "exact" });
  if (search) {
    query = query.ilike(nameKey, `%${search}%`);
  }

  const { data, count, error } = await query.order(nameKey, { ascending: true }).range(from, to);
  if (error) throw new Error(error.message);

  const mappedData = (data || []).map((item: any) => ({
    id: item.id,
    nama: item[nameKey] || "-",
    icon: item.icon || item.icon_name || "IconArmchair"
  }));

  return {
    data: mappedData,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
    totalItems: count || 0
  };
}

export async function getPaginatedAturan(search?: string, page: number = 1, pageSize: number = 10) {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: sample } = await supabaseAdmin.from("aturan").select("*").limit(1);
  let nameKey = "nama";
  if (sample && sample.length > 0) {
    nameKey = Object.keys(sample[0]).find(k => ["nama", "name", "nama_aturan"].includes(k)) || "nama";
  }

  let query = supabaseAdmin.from("aturan").select("*", { count: "exact" });
  if (search) {
    query = query.ilike(nameKey, `%${search}%`);
  }

  const { data, count, error } = await query.order(nameKey, { ascending: true }).range(from, to);
  if (error) throw new Error(error.message);

  const mappedData = (data || []).map((item: any) => ({
    id: item.id,
    nama: item[nameKey] || "-"
  }));

  return {
    data: mappedData,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
    totalItems: count || 0
  };
}

export async function upsertFasilitas(id: string | number | null, nama: string, icon: string) {
  await verifyAdminSession();
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: sample } = await supabaseAdmin.from("fasilitas").select("*").limit(1);
  let nameKey = "nama";
  let iconKey = "icon";
  if (sample && sample.length > 0) {
    nameKey = Object.keys(sample[0]).find(k => ["nama", "name", "nama_fasilitas"].includes(k)) || "nama";
    iconKey = Object.keys(sample[0]).find(k => ["icon", "icon_name", "kode_icon"].includes(k)) || "icon";
  }

  let error;
  const payload = { [nameKey]: nama, [iconKey]: icon || "IconArmchair" };
  if (id) {
    const { error: err } = await supabaseAdmin.from("fasilitas").update(payload).eq("id", id);
    error = err;
  } else {
    const { error: err } = await supabaseAdmin.from("fasilitas").insert([payload]);
    error = err;
  }

  if (error) throw new Error(error.message);
  revalidatePath("/admin/fasilitas-aturan");
  return { success: true };
}

export async function deleteFasilitas(id: string | number) {
  await verifyAdminSession();
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabaseAdmin.from("fasilitas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/fasilitas-aturan");
  return { success: true };
}

export async function upsertAturan(id: string | number | null, nama: string) {
  await verifyAdminSession();
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: sample } = await supabaseAdmin.from("aturan").select("*").limit(1);
  let nameKey = "nama";
  if (sample && sample.length > 0) {
    nameKey = Object.keys(sample[0]).find(k => ["nama", "name", "nama_aturan"].includes(k)) || "nama";
  }

  let error;
  if (id) {
    const { error: err } = await supabaseAdmin.from("aturan").update({ [nameKey]: nama }).eq("id", id);
    error = err;
  } else {
    const { error: err } = await supabaseAdmin.from("aturan").insert([{ [nameKey]: nama }]);
    error = err;
  }

  if (error) throw new Error(error.message);
  revalidatePath("/admin/fasilitas-aturan");
  return { success: true };
}

export async function deleteAturan(id: string | number) {
  await verifyAdminSession();
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabaseAdmin.from("aturan").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/fasilitas-aturan");
  return { success: true };
}

export async function getPaginatedLaporan(
  status?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10
) {
  await verifyAdminSession();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from("laporan")
    .select("*", { count: "exact" });

  if (status) {
    query = query.eq("status_laporan", status);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const userIds = Array.from(new Set((data || []).map((l: any) => l.id_user).filter(Boolean)));
  const kosIds = Array.from(new Set((data || []).map((l: any) => l.id_detail_kos).filter(Boolean)));

  let usersData: any[] = [];
  if (userIds.length > 0) {
    const { data: users } = await supabaseAdmin.from("users").select("*").in("id", userIds);
    if (users) usersData = users;
  }

  let kosData: any[] = [];
  if (kosIds.length > 0) {
    const { data: kos } = await supabaseAdmin.from("detail_kos").select("id, nama_kos").in("id", kosIds);
    if (kos) kosData = kos;
  }

  const mappedData = (data || []).map((l: any) => {
    const matchedUser = usersData.find((u) => String(u.id) === String(l.id_user));
    const matchedKos = kosData.find((k) => String(k.id) === String(l.id_detail_kos));

    const reporterName = matchedUser ? (matchedUser.name || matchedUser.nama || matchedUser.full_name) : "Pengguna Anonim";
    const kosName = matchedKos ? matchedKos.nama_kos : "Properti Telah Dihapus";

    const matchSearch = search
      ? reporterName.toLowerCase().includes(search.toLowerCase()) || kosName.toLowerCase().includes(search.toLowerCase())
      : true;

    if (!matchSearch) return null;

    return {
      id: l.id,
      created_at: l.created_at,
      deskripsi: l.deskripsi || "Tidak ada rincian deskripsi.",
      kategori: l.kategori || "lainnya",
      bukti_url: l.bukti_url || null,
      status: l.status_laporan || "menunggu",
      pelapor: reporterName,
      nama_kos: kosName,
      id_kos: l.id_detail_kos
    };
  }).filter(Boolean);

  return {
    data: mappedData,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
    totalItems: count || 0
  };
}

export async function resolveLaporanAction(laporanId: number | string, actionType: "ignore" | "takedown", kosId?: number | string) {
  await verifyAdminSession();
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  if (actionType === "takedown" && kosId) {
    const { error: kosError } = await supabaseAdmin
      .from("detail_kos")
      .update({ approval_status: "rejected", is_active: false })
      .eq("id", kosId);
    
    if (kosError) throw new Error(kosError.message);
  }

  const finalStatus = actionType === "takedown" ? "selesai" : "ditolak";
  const { error: laporanError } = await supabaseAdmin
    .from("laporan")
    .update({ status_laporan: finalStatus })
    .eq("id", laporanId);

  if (laporanError) throw new Error(laporanError.message);

  revalidatePath("/admin/laporan");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/kos/list");
  
  return { success: true };
}