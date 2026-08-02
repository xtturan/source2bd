CREATE TABLE public.search_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  marketplace text NOT NULL,
  page integer NOT NULL DEFAULT 1,
  results jsonb NOT NULL,
  item_count integer NOT NULL DEFAULT 0,
  hits integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (query, marketplace, page)
);

CREATE INDEX search_cache_showcase_idx ON public.search_cache (hits DESC, updated_at DESC);

GRANT SELECT ON public.search_cache TO anon;
GRANT SELECT ON public.search_cache TO authenticated;
GRANT ALL ON public.search_cache TO service_role;

ALTER TABLE public.search_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cached search results are public" ON public.search_cache
FOR SELECT TO anon, authenticated USING (true);