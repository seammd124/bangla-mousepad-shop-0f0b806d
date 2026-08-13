CREATE OR REPLACE FUNCTION public.place_order(
  p_customer_name text,
  p_email text,
  p_phone text,
  p_address text,
  p_city text,
  p_area text,
  p_postal_code text,
  p_design_id text,
  p_design_name text,
  p_thickness text,
  p_quantity integer,
  p_delivery_area text,
  p_note text
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_unit_price integer;
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

  v_unit_price := CASE p_thickness WHEN '4mm' THEN 1399 WHEN '5mm' THEN 1799 ELSE NULL END;
  IF v_unit_price IS NULL THEN
    RAISE EXCEPTION 'Invalid thickness';
  END IF;

  v_delivery_fee := CASE p_delivery_area WHEN 'dhaka' THEN 60 WHEN 'outside' THEN 120 ELSE NULL END;
  IF v_delivery_fee IS NULL THEN
    RAISE EXCEPTION 'Invalid delivery area';
  END IF;

  INSERT INTO public.orders (
    customer_name, email, phone, address, city, area, postal_code, country,
    design_id, design_name, thickness, quantity, delivery_area,
    unit_price, delivery_fee, total, note
  ) VALUES (
    p_customer_name, nullif(p_email, ''), p_phone, p_address, p_city, p_area, p_postal_code, 'Bangladesh',
    p_design_id, p_design_name, p_thickness, p_quantity, p_delivery_area,
    v_unit_price, v_delivery_fee, v_unit_price * p_quantity + v_delivery_fee, nullif(p_note, '')
  )
  RETURNING order_number INTO v_order_number;

  RETURN v_order_number;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(text, text, text, text, text, text, text, text, text, text, integer, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(text, text, text, text, text, text, text, text, text, text, integer, text, text) TO anon, authenticated, service_role;

DELETE FROM public.orders WHERE customer_name = 'T' AND phone = '+8801881655083';