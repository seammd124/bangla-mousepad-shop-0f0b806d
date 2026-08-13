import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { orderSchema, type OrderInput } from "./order-schema";
import { createPublicSupabaseClient } from "./supabase-public.server";

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

    const { data: orderNumber, error } = await supabase.rpc("place_order", {
      p_customer_name: data.customerName,
      p_email: data.email ?? "",
      p_phone: `+88${data.phone}`,
      p_address: data.address,
      p_city: data.city,
      p_area: data.area,
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

    return { orderNumber, total };
  });

export const listOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
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
