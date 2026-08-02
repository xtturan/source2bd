REVOKE ALL ON FUNCTION public.consume_user_usage(uuid, date, text, integer, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_user_usage(uuid, date, text, integer, integer, integer) TO service_role;

REVOKE ALL ON FUNCTION public.read_user_usage(uuid, date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.read_user_usage(uuid, date) TO service_role;