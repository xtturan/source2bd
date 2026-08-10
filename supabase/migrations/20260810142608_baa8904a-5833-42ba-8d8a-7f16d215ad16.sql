REVOKE ALL ON FUNCTION public.consume_daily_usage(text, date, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_user_usage(uuid, date, text, integer, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_user_usage(uuid, date) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_blocked(uuid, text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.consume_daily_usage(text, date, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_user_usage(uuid, date, text, integer, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_user_usage(uuid, date) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_blocked(uuid, text) TO service_role;