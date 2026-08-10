REVOKE EXECUTE ON FUNCTION public.is_blocked(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_blocked(uuid, text) TO service_role;