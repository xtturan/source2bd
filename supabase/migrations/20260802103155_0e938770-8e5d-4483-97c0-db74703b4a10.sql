CREATE POLICY "Admins can read search photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'search-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can record their own device"
ON public.device_accounts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);