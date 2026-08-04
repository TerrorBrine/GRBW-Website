CREATE TABLE public.unban_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ign text NOT NULL,
  discord_tag text NOT NULL,
  ban_reason text NOT NULL DEFAULT '',
  appeal text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.unban_requests TO anon, authenticated;
GRANT ALL ON public.unban_requests TO service_role;

ALTER TABLE public.unban_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an unban request"
ON public.unban_requests FOR INSERT TO anon, authenticated
WITH CHECK (status = 'pending' AND admin_note IS NULL);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_unban_requests_updated_at
BEFORE UPDATE ON public.unban_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TABLE IF EXISTS public.leaderboard_entries;