CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_bn text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  description_bn text NOT NULL DEFAULT '',
  thickness text NOT NULL CHECK (thickness IN ('4mm','5mm')),
  price integer NOT NULL CHECK (price >= 0),
  regular_price integer NOT NULL DEFAULT 0 CHECK (regular_price >= 0),
  image_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT TO anon, authenticated USING (active);
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.delivery_settings (
  id text PRIMARY KEY CHECK (id IN ('dhaka','outside')),
  label text NOT NULL,
  label_bn text NOT NULL DEFAULT '',
  fee integer NOT NULL CHECK (fee >= 0),
  eta text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.delivery_settings TO anon;
GRANT SELECT, UPDATE ON public.delivery_settings TO authenticated;
GRANT ALL ON public.delivery_settings TO service_role;

ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view delivery settings" ON public.delivery_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can update delivery settings" ON public.delivery_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER products_touch_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER delivery_settings_touch_updated_at BEFORE UPDATE ON public.delivery_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.delivery_settings (id, label, label_bn, fee, eta) VALUES
  ('dhaka', 'Inside Dhaka', 'ঢাকার ভিতরে', 70, '1–2 days'),
  ('outside', 'Outside Dhaka', 'ঢাকার বাইরে', 130, '3–5 days');

INSERT INTO public.products (id, name, name_bn, description, description_bn, thickness, price, regular_price, image_url, sort_order) VALUES
  ('blood-moon-samurai','Blood Moon Samurai','ব্লাড মুন সামুরাই','Lone warrior against a towering crimson moon, ink-wash style.','রক্তলাল চাঁদের সামনে একাকী যোদ্ধা, কালি-ধোয়া ধাঁচে আঁকা।','4mm',1399,1799,'/__l5e/assets-v1/5a275542-983b-4094-bfeb-911c27125e28/design-blood-moon-samurai.webp',1),
  ('interface-black','INTERFACE Black','ইন্টারফেস ব্ল্যাক','Sci-fi HUD wireframe tunnel on deep black.','গাঢ় কালোর উপর সাই-ফাই HUD ওয়্যারফ্রেম টানেল।','4mm',1399,1799,'/__l5e/assets-v1/e347556d-6194-4085-913b-54114359676b/design-interface-black.webp',2),
  ('interface-white','INTERFACE White','ইন্টারফেস হোয়াইট','The same HUD tunnel, inverted onto a clean white base.','একই HUD টানেল, ঝকঝকে সাদা বেসে উল্টানো।','4mm',1399,1799,'/__l5e/assets-v1/ad242899-2112-4e7c-9b72-6dc66336a941/design-interface-white.webp',3),
  ('midnight-galaxy','Midnight Galaxy','মিডনাইট গ্যালাক্সি','Stylised planets drifting across deep space greys.','গভীর মহাকাশের ধূসরতায় ভেসে বেড়ানো গ্রহ।','4mm',1399,1799,'/__l5e/assets-v1/fec19896-e2d6-4894-b031-7943a8be395a/design-midnight-galaxy.webp',4),
  ('neon-city','Neon City','নিয়ন সিটি','Cyberpunk street glowing in red and blue neon.','লাল-নীল নিয়ন আলোয় জ্বলজ্বলে সাইবারপাঙ্ক রাস্তা।','4mm',1399,1799,'/__l5e/assets-v1/3cb1250b-917c-43fa-b209-9c7c7e710767/design-neon-city.webp',5),
  ('matrix-blue','PC Parts Matrix Blue','পিসি পার্টস ম্যাট্রিক্স ব্লু','Teal line drawings of PC components on deep blue.','গাঢ় নীলে পিসি যন্ত্রাংশের টিল রেখাচিত্র।','4mm',1399,1799,'/__l5e/assets-v1/8c213c38-345b-48e5-be77-63970eb4b591/design-matrix-blue.webp',6),
  ('matrix-white','PC Parts Matrix White','পিসি পার্টস ম্যাট্রিক্স হোয়াইট','The same component schematic in grey on clean white.','একই যন্ত্রাংশের নকশা, সাদা বেসে ধূসর রেখায়।','4mm',1399,1799,'/__l5e/assets-v1/33378109-d259-450c-b572-bcf0e5314bed/design-matrix-white.webp',7),
  ('cyclops-blast','Cyclops Blast','সাইক্লপস ব্লাস্ট','Full-force optic blast in fiery red over midnight blue.','গাঢ় নীলের উপর জ্বলন্ত লাল অপটিক ব্লাস্ট।','5mm',1799,2299,'/__l5e/assets-v1/3cd04803-e4db-4f3e-8524-1aeb2ebf6554/design-cyclops-blast.webp',8),
  ('time-traveller','Time Traveller Astronaut','টাইম ট্রাভেলার অ্যাস্ট্রোনট','Astronaut adrift in a vortex of clock faces and red light.','ঘড়ির ঘূর্ণিতে ভেসে থাকা নভোচারী, লাল আলোর কেন্দ্র।','5mm',1799,2299,'/__l5e/assets-v1/f1b93f24-842c-4e5f-8eb1-f324f1a2e70a/design-time-traveller.webp',9);

CREATE OR REPLACE FUNCTION public.place_order(p_customer_name text, p_email text, p_phone text, p_address text, p_city text, p_area text, p_postal_code text, p_design_id text, p_design_name text, p_thickness text, p_quantity integer, p_delivery_area text, p_note text)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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