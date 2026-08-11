CREATE TABLE public.product_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  marketplace TEXT NOT NULL,
  product_id TEXT NOT NULL,
  source_url TEXT,
  payload JSONB NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (marketplace, product_id)
);

CREATE INDEX product_cache_url_idx ON public.product_cache (source_url);
CREATE INDEX product_cache_updated_idx ON public.product_cache (updated_at);

GRANT ALL ON public.product_cache TO service_role;

ALTER TABLE public.product_cache ENABLE ROW LEVEL SECURITY;