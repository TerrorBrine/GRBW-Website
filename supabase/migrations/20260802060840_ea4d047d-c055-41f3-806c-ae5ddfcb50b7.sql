CREATE TABLE public.home_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  youtube_id text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.home_videos TO anon;
GRANT SELECT ON public.home_videos TO authenticated;
GRANT ALL ON public.home_videos TO service_role;
ALTER TABLE public.home_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view home videos" ON public.home_videos FOR SELECT USING (true);

CREATE TABLE public.perks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '',
  badge text,
  features text[] NOT NULL DEFAULT '{}',
  purchase_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.perks TO anon;
GRANT SELECT ON public.perks TO authenticated;
GRANT ALL ON public.perks TO service_role;
ALTER TABLE public.perks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view perks" ON public.perks FOR SELECT USING (true);

CREATE TABLE public.store_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '',
  image_url text,
  stock_label text,
  purchase_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_items TO anon;
GRANT SELECT ON public.store_items TO authenticated;
GRANT ALL ON public.store_items TO service_role;
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view store items" ON public.store_items FOR SELECT USING (true);

CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  platform text NOT NULL DEFAULT 'link',
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_links TO anon;
GRANT SELECT ON public.social_links TO authenticated;
GRANT ALL ON public.social_links TO service_role;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view social links" ON public.social_links FOR SELECT USING (true);

CREATE TABLE public.leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id text UNIQUE,
  username text NOT NULL,
  avatar_url text,
  elo integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  mvps integer NOT NULL DEFAULT 0,
  winstreak integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.leaderboard_entries TO anon;
GRANT SELECT ON public.leaderboard_entries TO authenticated;
GRANT ALL ON public.leaderboard_entries TO service_role;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view leaderboard" ON public.leaderboard_entries FOR SELECT USING (true);
