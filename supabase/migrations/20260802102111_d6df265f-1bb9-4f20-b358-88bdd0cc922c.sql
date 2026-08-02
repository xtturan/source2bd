CREATE TABLE IF NOT EXISTS public.user_daily_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day date NOT NULL,
  search_count integer NOT NULL DEFAULT 0,
  detail_count integer NOT NULL DEFAULT 0,
  link_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);

GRANT SELECT ON public.user_daily_usage TO authenticated;
GRANT ALL ON public.user_daily_usage TO service_role;

ALTER TABLE public.user_daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
ON public.user_daily_usage FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.user_burst_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.user_burst_log TO service_role;
ALTER TABLE public.user_burst_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS user_burst_log_user_time_idx ON public.user_burst_log (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.consume_user_usage(
  _user_id uuid,
  _day date,
  _action text,
  _limit integer,
  _cost integer,
  _burst_limit integer DEFAULT 0
)
RETURNS TABLE(allowed boolean, used integer, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_used integer;
  burst_used integer;
BEGIN
  IF _action NOT IN ('search', 'detail', 'link') THEN
    RAISE EXCEPTION 'unknown action %', _action;
  END IF;

  INSERT INTO public.user_daily_usage (user_id, day)
  VALUES (_user_id, _day)
  ON CONFLICT (user_id, day) DO NOTHING;

  SELECT CASE _action
           WHEN 'search' THEN u.search_count
           WHEN 'detail' THEN u.detail_count
           ELSE u.link_count
         END
    INTO current_used
  FROM public.user_daily_usage u
  WHERE u.user_id = _user_id AND u.day = _day
  FOR UPDATE;

  IF current_used + _cost > _limit THEN
    RETURN QUERY SELECT false, current_used, 'daily'::text;
    RETURN;
  END IF;

  IF _burst_limit > 0 THEN
    DELETE FROM public.user_burst_log
    WHERE created_at < now() - interval '10 minutes';

    SELECT count(*) INTO burst_used
    FROM public.user_burst_log b
    WHERE b.user_id = _user_id
      AND b.action = _action
      AND b.created_at > now() - interval '1 minute';

    IF burst_used + _cost > _burst_limit THEN
      RETURN QUERY SELECT false, current_used, 'burst'::text;
      RETURN;
    END IF;

    INSERT INTO public.user_burst_log (user_id, action) VALUES (_user_id, _action);
  END IF;

  UPDATE public.user_daily_usage u
  SET search_count = u.search_count + CASE WHEN _action = 'search' THEN _cost ELSE 0 END,
      detail_count = u.detail_count + CASE WHEN _action = 'detail' THEN _cost ELSE 0 END,
      link_count   = u.link_count   + CASE WHEN _action = 'link'   THEN _cost ELSE 0 END,
      updated_at = now()
  WHERE u.user_id = _user_id AND u.day = _day
  RETURNING CASE _action
              WHEN 'search' THEN u.search_count
              WHEN 'detail' THEN u.detail_count
              ELSE u.link_count
            END
  INTO current_used;

  RETURN QUERY SELECT true, current_used, NULL::text;
END;
$$;

CREATE OR REPLACE FUNCTION public.read_user_usage(_user_id uuid, _day date)
RETURNS TABLE(search_count integer, detail_count integer, link_count integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(u.search_count, 0), COALESCE(u.detail_count, 0), COALESCE(u.link_count, 0)
  FROM (SELECT 1) x
  LEFT JOIN public.user_daily_usage u ON u.user_id = _user_id AND u.day = _day
$$;