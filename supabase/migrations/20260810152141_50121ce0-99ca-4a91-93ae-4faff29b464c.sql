REVOKE ALL ON FUNCTION public.read_user_usage(uuid, date) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.is_blocked(uuid, text) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.consume_daily_usage(text, date, integer, integer) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.consume_user_usage(uuid, date, text, integer, integer, integer) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.read_user_usage(uuid, date) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_blocked(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_daily_usage(text, date, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_user_usage(uuid, date, text, integer, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;