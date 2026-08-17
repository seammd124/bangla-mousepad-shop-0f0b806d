REVOKE INSERT ON public.orders FROM anon;

DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;

CREATE TABLE public.order_rate_limit (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  phone text,
  created_at timestamptz not null default now()
);

GRANT ALL ON public.order_rate_limit TO service_role;

ALTER TABLE public.order_rate_limit ENABLE ROW LEVEL SECURITY;

CREATE INDEX order_rate_limit_ip_created_idx ON public.order_rate_limit (ip_hash, created_at);
CREATE INDEX order_rate_limit_phone_created_idx ON public.order_rate_limit (phone, created_at);