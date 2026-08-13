import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import type {
  DeliveryAreaId,
  DeliveryOption,
  Product,
  Storefront,
  ThicknessId,
} from "./catalog";
import { createPublicSupabaseClient } from "./supabase-public.server";
import { checkIsAdmin } from "@/lib/is-admin";

type ProductRow = {
  id: string;
  name: string;
  name_bn: string;
  description: string;
  description_bn: string;
  thickness: string;
  price: number;
  regular_price: number;
  image_url: string;
  sort_order: number;
  active: boolean;
};

type DeliveryRow = {
  id: string;
  label: string;
  label_bn: string;
  fee: number;
  eta: string;
};

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    nameBn: row.name_bn,
    description: row.description,
    descriptionBn: row.description_bn,
    thickness: row.thickness as ThicknessId,
    price: row.price,
    regularPrice: row.regular_price,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    active: row.active,
  };
}

function mapDelivery(row: DeliveryRow): DeliveryOption {
  return {
    id: row.id as DeliveryAreaId,
    label: row.label,
    labelBn: row.label_bn,
    fee: row.fee,
    eta: row.eta,
  };
}

/** Public storefront catalogue — active products + current delivery charges. */
export const getStorefront = createServerFn({ method: "GET" }).handler(
  async (): Promise<Storefront> => {
    const supabase = createPublicSupabaseClient();

    const [productsRes, deliveryRes] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabase.from("delivery_settings").select("*").order("fee", { ascending: true }),
    ]);

    if (productsRes.error) throw new Error(productsRes.error.message);
    if (deliveryRes.error) throw new Error(deliveryRes.error.message);

    return {
      products: (productsRes.data ?? []).map(mapProduct),
      delivery: (deliveryRes.data ?? []).map(mapDelivery),
    };
  },
);

async function assertAdmin(context: { supabase: any; userId: string }) {
  const isAdmin = await checkIsAdmin(context.supabase, context.userId);
  if (!isAdmin) throw new Error("Forbidden");
}

/** Admin catalogue — includes hidden products. */
export const adminGetCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);

    const [productsRes, deliveryRes] = await Promise.all([
      context.supabase.from("products").select("*").order("sort_order", { ascending: true }),
      context.supabase.from("delivery_settings").select("*").order("fee", { ascending: true }),
    ]);

    if (productsRes.error) throw new Error(productsRes.error.message);
    if (deliveryRes.error) throw new Error(deliveryRes.error.message);

    return {
      products: (productsRes.data ?? []).map(mapProduct),
      delivery: (deliveryRes.data ?? []).map(mapDelivery),
    };
  });

export interface ProductInput {
  id: string;
  name: string;
  nameBn?: string;
  description?: string;
  descriptionBn?: string;
  thickness: ThicknessId;
  price: number;
  regularPrice: number;
  imageUrl?: string;
  sortOrder?: number;
  active?: boolean;
}

function validateProduct(data: ProductInput): ProductInput {
  if (!/^[a-z0-9-]{2,60}$/.test(data.id)) {
    throw new Error("Product code must be lowercase letters, numbers and dashes");
  }
  if (!data.name.trim()) throw new Error("Name is required");
  if (!["4mm", "5mm"].includes(data.thickness)) throw new Error("Invalid thickness");
  if (!Number.isInteger(data.price) || data.price < 0 || data.price > 100000) {
    throw new Error("Invalid price");
  }
  if (!Number.isInteger(data.regularPrice) || data.regularPrice < 0 || data.regularPrice > 100000) {
    throw new Error("Invalid regular price");
  }
  return data;
}

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateProduct)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    const { error } = await context.supabase.from("products").upsert({
      id: data.id,
      name: data.name.trim(),
      name_bn: data.nameBn?.trim() ?? "",
      description: data.description?.trim() ?? "",
      description_bn: data.descriptionBn?.trim() ?? "",
      thickness: data.thickness,
      price: data.price,
      regular_price: data.regularPrice,
      image_url: data.imageUrl ?? "",
      sort_order: data.sortOrder ?? 0,
      active: data.active ?? true,
    });

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveDeliverySetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: DeliveryAreaId; fee: number; eta?: string }) => {
    if (!["dhaka", "outside"].includes(data.id)) throw new Error("Invalid delivery area");
    if (!Number.isInteger(data.fee) || data.fee < 0 || data.fee > 10000) {
      throw new Error("Invalid delivery charge");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const patch: { fee: number; eta?: string } = { fee: data.fee };
    if (data.eta !== undefined) patch.eta = data.eta.trim();

    const { error } = await context.supabase
      .from("delivery_settings")
      .update(patch)
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
