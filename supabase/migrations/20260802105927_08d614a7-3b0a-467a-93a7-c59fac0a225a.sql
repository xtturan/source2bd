DROP POLICY IF EXISTS "Cached search results are public" ON public.search_cache;

REVOKE ALL ON public.search_cache FROM anon;
REVOKE ALL ON public.search_cache FROM authenticated;
GRANT ALL ON public.search_cache TO service_role;

CREATE POLICY "Admins can view cached searches"
ON public.search_cache
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view search photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage search photos" ON storage.objects;

CREATE POLICY "Admins can view search photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'search-photos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage search photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'search-photos' AND public.has_role(auth.uid(), 'admin'::app_role));