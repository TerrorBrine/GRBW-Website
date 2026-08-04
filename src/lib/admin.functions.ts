import { createServerFn } from "@tanstack/react-start";
import {
  adminDb,
  getAdminSession,
  isAdmin,
  nextSortOrder,
  passwordMatches,
} from "@/lib/admin.server";
import {
  idInput,
  reviewInput,
  unbanInput,
  linkInput,
  perkInput,
  storeItemInput,
  videoInput,
} from "@/lib/schemas";

export const getAdminStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { admin: await isAdmin() };
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_PASSWORD"];
    if (!expected) return { ok: false as const, reason: "unconfigured" as const };
    if (!passwordMatches(data.password ?? "", expected)) {
      return { ok: false as const, reason: "invalid" as const };
    }
    const session = await getAdminSession();
    await session.update({ admin: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAdminSession();
  await session.clear();
  return { ok: true as const };
});

export const createPerk = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => perkInput.parse(data))
  .handler(async ({ data }) => {
    const db = await adminDb();
    const { error } = await db
      .from("perks")
      .insert({ ...data, sort_order: await nextSortOrder("perks") });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deletePerk = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => idInput.parse(data))
  .handler(async ({ data }) => {
    const db = await adminDb();
    const { error } = await db.from("perks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const createStoreItem = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => storeItemInput.parse(data))
  .handler(async ({ data }) => {
    const db = await adminDb();
    const { error } = await db
      .from("store_items")
      .insert({ ...data, sort_order: await nextSortOrder("store_items") });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteStoreItem = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => idInput.parse(data))
  .handler(async ({ data }) => {
    const db = await adminDb();
    const { error } = await db.from("store_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const createLink = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => linkInput.parse(data))
  .handler(async ({ data }) => {
    const db = await adminDb();
    const { error } = await db
      .from("social_links")
      .insert({ ...data, sort_order: await nextSortOrder("social_links") });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteLink = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => idInput.parse(data))
  .handler(async ({ data }) => {
    const db = await adminDb();
    const { error } = await db.from("social_links").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const createVideo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => videoInput.parse(data))
  .handler(async ({ data }) => {
    const db = await adminDb();
    const { error } = await db
      .from("home_videos")
      .insert({ ...data, sort_order: await nextSortOrder("home_videos") });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteVideo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => idInput.parse(data))
  .handler(async ({ data }) => {
    const db = await adminDb();
    const { error } = await db.from("home_videos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const submitUnbanRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => unbanInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("unban_requests").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listUnbanRequests = createServerFn({ method: "GET" }).handler(async () => {
  const db = await adminDb();
  const { data, error } = await db
    .from("unban_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const reviewUnbanRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => reviewInput.parse(data))
  .handler(async ({ data }) => {
    const db = await adminDb();
    const { error } = await db
      .from("unban_requests")
      .update({ status: data.status, admin_note: data.admin_note || null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteUnbanRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => idInput.parse(data))
  .handler(async ({ data }) => {
    const db = await adminDb();
    const { error } = await db.from("unban_requests").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
