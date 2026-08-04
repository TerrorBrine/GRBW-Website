import { z } from "zod";

const paymentFields = {
  price_usd: z.string().max(40).nullable().default(null),
  price_inr: z.string().max(40).nullable().default(null),
  paypal_url: z.string().max(500).nullable().default(null),
  gpay_url: z.string().max(500).nullable().default(null),
  ticket_url: z.string().max(500).nullable().default(null),
};

export const perkInput = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(600).default(""),
  price: z.string().max(40).default(""),
  badge: z.string().max(30).nullable().default(null),
  features: z.array(z.string().max(120)).default([]),
  purchase_url: z.string().max(500).nullable().default(null),
  ...paymentFields,
});

export const storeItemInput = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(600).default(""),
  price: z.string().max(40).default(""),
  image_url: z.string().max(500).nullable().default(null),
  stock_label: z.string().max(40).nullable().default(null),
  purchase_url: z.string().max(500).nullable().default(null),
  ...paymentFields,
});

export const linkInput = z.object({
  label: z.string().min(1).max(60),
  url: z.string().min(1).max(500),
  platform: z.string().max(30).default("link"),
  description: z.string().max(200).default(""),
});

export const videoInput = z.object({
  title: z.string().max(120).default(""),
  youtube_id: z.string().min(5).max(30),
});

export const unbanInput = z.object({
  ign: z.string().trim().min(1).max(40),
  discord_tag: z.string().trim().min(1).max(60),
  ban_reason: z.string().trim().max(300).default(""),
  appeal: z.string().trim().min(20).max(2000),
});

export const reviewInput = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "denied"]),
  admin_note: z.string().trim().max(500).default(""),
});

export const idInput = z.object({ id: z.string().uuid() });

export type PerkInput = z.infer<typeof perkInput>;
export type StoreItemInput = z.infer<typeof storeItemInput>;
export type LinkInput = z.infer<typeof linkInput>;
export type VideoInput = z.infer<typeof videoInput>;
export type UnbanInput = z.infer<typeof unbanInput>;
