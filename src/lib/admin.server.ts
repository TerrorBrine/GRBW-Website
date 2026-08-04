import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

export type AdminSession = { admin?: boolean };

function sessionConfig() {
  const password = process.env["SESSION_SECRET"];
  if (!password) throw new Error("SESSION_SECRET is not configured");
  return {
    password,
    name: "grbw-admin",
    maxAge: 60 * 60 * 24 * 7,
    // sameSite "none" so the admin cookie is still sent when the site is
    // rendered inside the Lovable preview iframe (a cross-site context).
    cookie: { httpOnly: true, secure: true, sameSite: "none" as const, path: "/" },
  };
}

export async function getAdminSession() {
  return useSession<AdminSession>(sessionConfig());
}

export function passwordMatches(input: string, expected: string) {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export async function isAdmin() {
  const session = await getAdminSession();
  return session.data.admin === true;
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Not authorized");
}

export async function adminDb() {
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function nextSortOrder(
  table: "perks" | "store_items" | "social_links" | "home_videos",
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from(table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.sort_order ?? 0) + 1;
}
