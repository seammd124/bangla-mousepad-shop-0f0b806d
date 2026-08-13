-- 1. Move has_role into a non-exposed schema
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _user_id IS NULL OR auth.uid() IS NULL OR _user_id <> auth.uid() THEN false
    ELSE EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
  END;
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2. Re-create every policy that referenced public.has_role
DROP POLICY IF EXISTS "Admins can update delivery settings" ON public.delivery_settings;
CREATE POLICY "Admins can update delivery settings" ON public.delivery_settings
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view meta settings" ON public.meta_settings;
CREATE POLICY "Admins can view meta settings" ON public.meta_settings
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert meta settings" ON public.meta_settings;
CREATE POLICY "Admins can insert meta settings" ON public.meta_settings
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update meta settings" ON public.meta_settings;
CREATE POLICY "Admins can update meta settings" ON public.meta_settings
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can read orders" ON public.orders;
CREATE POLICY "Admins can read orders" ON public.orders
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- Storage policies also depend on the old helper
DROP POLICY IF EXISTS "Admins can read product images" ON storage.objects;
CREATE POLICY "Admins can read product images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 3. Price-validating INSERT policy on orders
DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
CREATE POLICY "Anyone can place an order" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(customer_name) BETWEEN 1 AND 120
    AND phone ~ '^\+8801[3-9][0-9]{8}$'
    AND char_length(address) BETWEEN 1 AND 400
    AND quantity BETWEEN 1 AND 5
    AND status = 'new'::public.order_status
    AND country = 'Bangladesh'
    AND EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = orders.design_id
        AND p.active
        AND p.thickness = orders.thickness
        AND p.name = orders.design_name
        AND p.price = orders.unit_price
    )
    AND EXISTS (
      SELECT 1 FROM public.delivery_settings d
      WHERE d.id = orders.delivery_area
        AND d.fee = orders.delivery_fee
    )
    AND orders.total = orders.unit_price * orders.quantity + orders.delivery_fee
  );

-- 4. place_order no longer needs elevated privileges
CREATE OR REPLACE FUNCTION public.place_order(p_customer_name text, p_email text, p_phone text, p_address text, p_city text, p_area text, p_postal_code text, p_design_id text, p_design_name text, p_thickness text, p_quantity integer, p_delivery_area text, p_note text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
DECLARE
  v_product public.products%ROWTYPE;
  v_delivery_fee integer;
  v_order_number bigint;
BEGIN
  IF char_length(coalesce(p_customer_name, '')) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;
  IF p_phone !~ '^\+8801[3-9][0-9]{8}$' THEN
    RAISE EXCEPTION 'Invalid phone';
  END IF;
  IF char_length(coalesce(p_address, '')) NOT BETWEEN 1 AND 400 THEN
    RAISE EXCEPTION 'Invalid address';
  END IF;
  IF p_quantity IS NULL OR p_quantity NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'Invalid quantity';
  END IF;

  SELECT * INTO v_product FROM public.products WHERE id = p_design_id AND active;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid design';
  END IF;

  SELECT fee INTO v_delivery_fee FROM public.delivery_settings WHERE id = p_delivery_area;
  IF v_delivery_fee IS NULL THEN
    RAISE EXCEPTION 'Invalid delivery area';
  END IF;

  INSERT INTO public.orders (
    customer_name, email, phone, address, city, area, postal_code, country,
    design_id, design_name, thickness, quantity, delivery_area,
    unit_price, delivery_fee, total, note
  ) VALUES (
    p_customer_name, nullif(p_email, ''), p_phone, p_address, p_city, p_area, p_postal_code, 'Bangladesh',
    v_product.id, v_product.name, v_product.thickness, p_quantity, p_delivery_area,
    v_product.price, v_delivery_fee, v_product.price * p_quantity + v_delivery_fee, nullif(p_note, '')
  )
  RETURNING order_number INTO v_order_number;

  RETURN v_order_number;
END;
$function$;

REVOKE ALL ON FUNCTION public.place_order(text, text, text, text, text, text, text, text, text, text, integer, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(text, text, text, text, text, text, text, text, text, text, integer, text, text) TO anon, authenticated, service_role;