import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { orderSchema, type OrderInput } from "./order-schema";
import { createPublicSupabaseClient } from "./supabase-public.server";
import { checkIsAdmin } from "@/lib/is-admin";

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data: OrderInput) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = createPublicSupabaseClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, thickness, price")
      .eq("id", data.designId)
      .eq("active", true)
      .maybeSingle();

    const { data: delivery, error: deliveryError } = await supabase
      .from("delivery_settings")
      .select("id, fee")
      .eq("id", data.deliveryArea)
      .maybeSingle();

    if (productError || deliveryError || !product || !delivery) {
      throw new Error("Invalid product selection");
    }

    // Price and delivery charge always come from the database, never the client.
    const total = product.price * data.quantity + delivery.fee;

    // The order-placing routine is server-only: it is executable by the
    // service role alone, so visitors cannot invoke it from the browser.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // ---- Rate limiting (service-role only table) ----
    const { getRequestHeaders: getHeadersForRateLimit } = await import("@tanstack/react-start/server");
    const rlHeaders = getHeadersForRateLimit();
    const rawIp =
      (rlHeaders.get("cf-connecting-ip") ?? rlHeaders.get("x-forwarded-for") ?? "")
        .split(",")[0]
        ?.trim() || "unknown";

    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawIp));
    const ipHash = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const fullPhone = `+88${data.phone}`;
    const now = Date.now();
    const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
    const TOO_MANY = "অনেকবার চেষ্টা করা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন।";

    const [tenMin, dayWindow, phoneWindow] = await Promise.all([
      supabaseAdmin
        .from("order_rate_limit")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", iso(10 * 60 * 1000)),
      supabaseAdmin
        .from("order_rate_limit")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", iso(24 * 60 * 60 * 1000)),
      supabaseAdmin
        .from("order_rate_limit")
        .select("id", { count: "exact", head: true })
        .eq("phone", fullPhone)
        .gte("created_at", iso(5 * 60 * 1000)),
    ]);

    // When the IP header is missing (preview/proxy), every visitor would share the
    // same "unknown" bucket — so only the phone throttle applies in that case.
    const ipKnown = rawIp !== "unknown";
    if (
      (ipKnown && ((tenMin.count ?? 0) >= 3 || (dayWindow.count ?? 0) >= 8)) ||
      (phoneWindow.count ?? 0) >= 1
    ) {
      throw new Error(TOO_MANY);
    }


    const { data: orderNumber, error } = await supabaseAdmin.rpc("place_order", {
      p_customer_name: data.customerName,
      p_email: data.email ?? "",
      p_phone: `+88${data.phone}`,
      p_address: data.address,
      p_city: "",
      p_area: "",
      p_postal_code: data.postalCode,
      p_design_id: product.id,
      p_design_name: product.name,
      p_thickness: product.thickness,
      p_quantity: data.quantity,
      p_delivery_area: delivery.id,
      p_note: data.note ?? "",
    });

    if (error) {
      console.error("placeOrder failed", error.message);
      throw new Error("Could not save your order. Please try again.");
    }

    await supabaseAdmin.from("order_rate_limit").insert({ ip_hash: ipHash, phone: fullPhone });
    // Opportunistic cleanup of throttle rows older than 7 days.
    await supabaseAdmin
      .from("order_rate_limit")
      .delete()
      .lt("created_at", new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString());


    // Meta Conversions API (server-side Purchase event, deduped with the browser pixel).
    const eventId = `order-${String(orderNumber)}`;
    const { getRequestHeaders } = await import("@tanstack/react-start/server");
    const { sendCapiEvent } = await import("./meta.server");
    const headers = getRequestHeaders();
    const cookie = headers.get("cookie") ?? "";
    const readCookie = (name: string) =>
      cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1);

    await sendCapiEvent({
      eventId,
      eventName: "Purchase",
      value: total,
      currency: "BDT",
      contentIds: [product.id],
      contentName: product.name,
      quantity: data.quantity,
      email: data.email ?? undefined,
      phone: `88${data.phone}`,
      firstName: data.customerName,
      postalCode: data.postalCode,
      clientIp: (headers.get("cf-connecting-ip") ?? headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim(),
      userAgent: headers.get("user-agent") ?? undefined,
      fbp: readCookie("_fbp"),
      fbc: readCookie("_fbc"),
      sourceUrl: headers.get("referer") ?? undefined,
    });

    return { orderNumber, total, eventId };
  });


export const listOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const isAdmin = await checkIsAdmin(context.supabase, context.userId);
    if (!isAdmin) return { isAdmin: false as const, orders: [] };

    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw new Error(error.message);
    return { isAdmin: true as const, orders: data ?? [] };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string }) => data)
  .handler(async ({ data, context }) => {
    const allowed = ["new", "confirmed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(data.status)) throw new Error("Invalid status");

    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status as "new" })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
