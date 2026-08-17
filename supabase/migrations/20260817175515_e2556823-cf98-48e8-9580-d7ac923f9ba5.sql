REVOKE ALL ON public.order_rate_limit FROM anon, authenticated;
GRANT ALL ON public.order_rate_limit TO service_role;