/** Server-only helpers for Meta Pixel / Conversions API. */

export interface MetaSettings {
  pixel_id: string;
  access_token: string;
  test_event_code: string;
  pixel_enabled: boolean;
  capi_enabled: boolean;
}

export async function loadMetaSettings(): Promise<MetaSettings | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("meta_settings")
    .select("pixel_id, access_token, test_event_code, pixel_enabled, capi_enabled")
    .eq("id", "default")
    .maybeSingle();

  if (error || !data) return null;
  return data as MetaSettings;
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface CapiPurchase {
  eventId: string;
  eventName: string;
  value: number;
  currency: string;
  contentIds: string[];
  contentName?: string | undefined;
  quantity?: number | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  firstName?: string | undefined;
  city?: string | undefined;
  postalCode?: string | undefined;
  clientIp?: string | undefined;
  userAgent?: string | undefined;
  fbp?: string | undefined;
  fbc?: string | undefined;
  sourceUrl?: string | undefined;
}

/** Fire a server-side Conversions API event. Never throws — tracking must not break orders. */
export async function sendCapiEvent(event: CapiPurchase) {
  try {
    const settings = await loadMetaSettings();
    if (!settings?.capi_enabled || !settings.pixel_id || !settings.access_token) return;

    const userData: Record<string, unknown> = {};
    if (event.email) userData["em"] = [await sha256(event.email)];
    if (event.phone) userData["ph"] = [await sha256(event.phone.replace(/[^0-9]/g, ""))];
    if (event.firstName) userData["fn"] = [await sha256(event.firstName.split(" ")[0] ?? "")];
    if (event.city) userData["ct"] = [await sha256(event.city.replace(/\s+/g, ""))];
    if (event.postalCode) userData["zp"] = [await sha256(event.postalCode)];
    userData["country"] = [await sha256("bd")];
    if (event.clientIp) userData["client_ip_address"] = event.clientIp;
    if (event.userAgent) userData["client_user_agent"] = event.userAgent;
    if (event.fbp) userData["fbp"] = event.fbp;
    if (event.fbc) userData["fbc"] = event.fbc;

    const body = {
      data: [
        {
          event_name: event.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: event.eventId,
          action_source: "website",
          event_source_url: event.sourceUrl,
          user_data: userData,
          custom_data: {
            currency: event.currency,
            value: event.value,
            content_type: "product",
            content_ids: event.contentIds,
            content_name: event.contentName,
            num_items: event.quantity ?? 1,
          },
        },
      ],
      ...(settings.test_event_code ? { test_event_code: settings.test_event_code } : {}),
    };

    const res = await fetch(
      `https://graph.facebook.com/v20.0/${settings.pixel_id}/events?access_token=${encodeURIComponent(settings.access_token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      console.error("Meta CAPI error", res.status, (await res.text()).slice(0, 300));
    }
  } catch (err) {
    console.error("Meta CAPI failed", err instanceof Error ? err.message : err);
  }
}
