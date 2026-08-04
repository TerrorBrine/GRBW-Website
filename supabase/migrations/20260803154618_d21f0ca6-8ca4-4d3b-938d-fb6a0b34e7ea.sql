ALTER TABLE public.perks
  ADD COLUMN IF NOT EXISTS price_usd text,
  ADD COLUMN IF NOT EXISTS price_inr text,
  ADD COLUMN IF NOT EXISTS paypal_url text,
  ADD COLUMN IF NOT EXISTS gpay_url text,
  ADD COLUMN IF NOT EXISTS ticket_url text;

ALTER TABLE public.store_items
  ADD COLUMN IF NOT EXISTS price_usd text,
  ADD COLUMN IF NOT EXISTS price_inr text,
  ADD COLUMN IF NOT EXISTS paypal_url text,
  ADD COLUMN IF NOT EXISTS gpay_url text,
  ADD COLUMN IF NOT EXISTS ticket_url text;