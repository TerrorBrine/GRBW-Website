import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const perksQuery = queryOptions({
  queryKey: ["perks"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("perks")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});

export const storeQuery = queryOptions({
  queryKey: ["store_items"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("store_items")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});

export const linksQuery = queryOptions({
  queryKey: ["social_links"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("social_links")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});

export const videosQuery = queryOptions({
  queryKey: ["home_videos"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("home_videos")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});
