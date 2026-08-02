CREATE TABLE public.daily_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_key text NOT NULL,
  day date NOT NULL,
  used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (visitor_key, day)
);

GRANT ALL ON public.daily_usage TO service_role;

ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_daily_usage(_visitor_key text, _day date, _limit integer, _cost integer)
RETURNS TABLE (allowed boolean, used integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_used integer;
BEGIN
  INSERT INTO public.daily_usage (visitor_key, day, used)
  VALUES (_visitor_key, _day, 0)
  ON CONFLICT (visitor_key, day) DO NOTHING;

  SELECT d.used INTO current_used FROM public.daily_usage d
  WHERE d.visitor_key = _visitor_key AND d.day = _day FOR UPDATE;

  IF current_used + _cost > _limit THEN
    RETURN QUERY SELECT false, current_used;
  END IF;

  UPDATE public.daily_usage d
  SET used = d.used + _cost, updated_at = now()
  WHERE d.visitor_key = _visitor_key AND d.day = _day
  RETURNING d.used INTO current_used;

  RETURN QUERY SELECT true, current_used;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_daily_usage(text, date, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_daily_usage(text, date, integer, integer) TO service_role;