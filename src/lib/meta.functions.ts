import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkIsAdmin } from "@/lib/is-admin";

/** Public: only the pixel id, and only when tracking is switched on. */
export const getMetaPixelConfig = createServerFn({ method: "GET" }).handler(async () => {
  const { loadMetaSettings } = await import("./meta.server");
  const settings = await loadMetaSettings();
  if (!settings?.pixel_enabled || !settings.pixel_id) return { pixelId: null as string | null };
  return { pixelId: settings.pixel_id };
});

/** Admin: full settings (access token is masked to the last 4 characters). */
export const adminGetMetaSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const isAdmin = await checkIsAdmin(context.supabase, context.userId);
    if (!isAdmin) throw new Error("Forbidden");

    const { data, error } = await context.supabase
      .from("meta_settings")
      .select("pixel_id, access_token, test_event_code, pixel_enabled, capi_enabled")
      .eq("id", "default")
      .maybeSingle();

    if (error) throw new Error(error.message);

    const token = data?.access_token ?? "";
    return {
      pixelId: data?.pixel_id ?? "",
      testEventCode: data?.test_event_code ?? "",
      pixelEnabled: data?.pixel_enabled ?? false,
      capiEnabled: data?.capi_enabled ?? false,
      hasToken: token.length > 0,
      tokenHint: token ? `••••${token.slice(-4)}` : "",
    };
  });

export interface MetaSettingsInput {
  pixelId: string;
  accessToken?: string;
  testEventCode: string;
  pixelEnabled: boolean;
  capiEnabled: boolean;
}

export const adminSaveMetaSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: MetaSettingsInput) => {
    if (data.pixelId && !/^\d{6,25}$/.test(data.pixelId.trim())) {
      throw new Error("Pixel ID must be numeric");
    }
    if (data.testEventCode && data.testEventCode.length > 40) {
      throw new Error("Invalid test event code");
    }
    if (data.accessToken && data.accessToken.length > 1000) {
      throw new Error("Invalid access token");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const isAdmin = await checkIsAdmin(context.supabase, context.userId);
    if (!isAdmin) throw new Error("Forbidden");

    const patch: Record<string, unknown> = {
      id: "default",
      pixel_id: data.pixelId.trim(),
      test_event_code: data.testEventCode.trim(),
      pixel_enabled: data.pixelEnabled,
      capi_enabled: data.capiEnabled,
    };
    // Empty token field = keep the stored token.
    if (data.accessToken && data.accessToken.trim()) {
      patch["access_token"] = data.accessToken.trim();
    }

    const { error } = await context.supabase.from("meta_settings").upsert(patch as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: clear the stored Conversions API token. */
export const adminClearMetaToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const isAdmin = await checkIsAdmin(context.supabase, context.userId);
    if (!isAdmin) throw new Error("Forbidden");

    const { error } = await context.supabase
      .from("meta_settings")
      .update({ access_token: "", capi_enabled: false })
      .eq("id", "default");

    if (error) throw new Error(error.message);
    return { ok: true };
  });
