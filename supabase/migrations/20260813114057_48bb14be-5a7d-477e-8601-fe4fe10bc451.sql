CREATE TABLE public.meta_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  pixel_id TEXT NOT NULL DEFAULT '',
  access_token TEXT NOT NULL DEFAULT '',
  test_event_code TEXT NOT NULL DEFAULT '',
  pixel_enabled BOOLEAN NOT NULL DEFAULT false,
  capi_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.meta_settings TO authenticated;
GRANT ALL ON public.meta_settings TO service_role;

ALTER TABLE public.meta_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view meta settings"
ON public.meta_settings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert meta settings"
ON public.meta_settings FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update meta settings"
ON public.meta_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_meta_settings_updated_at
BEFORE UPDATE ON public.meta_settings
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.meta_settings (id) VALUES ('default');