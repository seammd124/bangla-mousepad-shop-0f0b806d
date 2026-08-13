import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogoLockup } from "@/components/site/Logo";
import { discountPercent, formatBdt, type DeliveryOption, type Product } from "@/lib/catalog";
import {
  adminGetCatalog,
  deleteProduct,
  saveDeliverySetting,
  saveProduct,
} from "@/lib/catalog.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/catalog")({
  head: () => ({
    meta: [
      { title: "Catalog & Pricing — Unique Modz" },
      { name: "description", content: "Manage Unipadz product prices, images and delivery charges." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Catalog & Pricing — Unique Modz" },
      { property: "og:description", content: "Manage Unipadz products and delivery charges." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CatalogPage,
});

const EMPTY: Product = {
  id: "",
  name: "",
  nameBn: "",
  description: "",
  descriptionBn: "",
  thickness: "4mm",
  price: 1399,
  regularPrice: 1799,
  imageUrl: "",
  sortOrder: 99,
  active: true,
};

function CatalogPage() {
  const queryClient = useQueryClient();
  const fetchCatalog = useServerFn(adminGetCatalog);
  const persistProduct = useServerFn(saveProduct);
  const removeProduct = useServerFn(deleteProduct);
  const persistDelivery = useServerFn(saveDeliverySetting);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-catalog"],
    queryFn: () => fetchCatalog(),
    retry: false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
  };

  const productMutation = useMutation({
    mutationFn: (p: Product) =>
      persistProduct({
        data: {
          id: p.id.trim(),
          name: p.name,
          nameBn: p.nameBn,
          description: p.description,
          descriptionBn: p.descriptionBn,
          thickness: p.thickness,
          price: Number(p.price),
          regularPrice: Number(p.regularPrice),
          imageUrl: p.imageUrl,
          sortOrder: Number(p.sortOrder),
          active: p.active,
        },
      }),
    onSuccess: () => {
      toast.success("Product saved");
      setCreating(false);
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save product"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeProduct({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      invalidate();
    },
    onError: () => toast.error("Could not delete product"),
  });

  const deliveryMutation = useMutation({
    mutationFn: (d: DeliveryOption) =>
      persistDelivery({ data: { id: d.id, fee: Number(d.fee), eta: d.eta } }),
    onSuccess: () => {
      toast.success("Delivery charge updated");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update charge"),
  });

  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
          <LogoLockup compact />
          <Button asChild variant="outline" className="rounded-none uppercase tracking-[0.14em]">
            <Link to="/admin">Orders</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">
          Catalog &amp; pricing
        </h1>
        <p className="bn mt-2 text-sm text-muted-foreground">
          এখান থেকে প্রতিটি ডিজাইনের দাম, ছবি ও ডেলিভারি চার্জ পরিবর্তন করলে সাথে সাথেই ওয়েবসাইটে
          আপডেট হবে।
        </p>

        {isLoading ? (
          <p className="mt-8 text-muted-foreground">Loading catalog…</p>
        ) : error ? (
          <div className="mt-8 border border-ink bg-background p-8">
            <h2 className="font-display text-xl font-black uppercase">No admin access</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This account does not have the admin role.
            </p>
          </div>
        ) : data ? (
          <>
            {/* Delivery charges */}
            <section className="mt-8 border border-ink bg-background p-6">
              <h2 className="font-display text-xl font-black uppercase">Delivery charges</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {data.delivery.map((option) => (
                  <DeliveryCard
                    key={option.id}
                    option={option}
                    saving={deliveryMutation.isPending}
                    onSave={(next) => deliveryMutation.mutate(next)}
                  />
                ))}
              </div>
            </section>

            {/* Products */}
            <section className="mt-10">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-black uppercase">
                  Products ({data.products.length})
                </h2>
                <Button
                  className="rounded-none uppercase tracking-[0.14em]"
                  onClick={() => setCreating((v) => !v)}
                >
                  <Plus className="size-4" /> New product
                </Button>
              </div>

              {creating ? (
                <div className="mt-5">
                  <ProductCard
                    product={EMPTY}
                    isNew
                    saving={productMutation.isPending}
                    onSave={(p) => productMutation.mutate(p)}
                    onCancel={() => setCreating(false)}
                  />
                </div>
              ) : null}

              <div className="mt-5 space-y-5">
                {data.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    saving={productMutation.isPending}
                    onSave={(p) => productMutation.mutate(p)}
                    onDelete={() => {
                      if (confirm(`Delete ${product.name}?`)) deleteMutation.mutate(product.id);
                    }}
                  />
                ))}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

function DeliveryCard({
  option,
  saving,
  onSave,
}: {
  option: DeliveryOption;
  saving: boolean;
  onSave: (option: DeliveryOption) => void;
}) {
  const [draft, setDraft] = useState(option);
  useEffect(() => setDraft(option), [option]);
  const dirty = draft.fee !== option.fee || draft.eta !== option.eta;

  return (
    <div className="border border-border p-5">
      <p className="font-semibold">{option.label}</p>
      <p className="bn text-sm text-muted-foreground">{option.labelBn}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`fee-${option.id}`}>Charge (৳)</Label>
          <Input
            id={`fee-${option.id}`}
            type="number"
            min={0}
            className="mt-2 rounded-none"
            value={draft.fee}
            onChange={(e) => setDraft({ ...draft, fee: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor={`eta-${option.id}`}>Delivery time</Label>
          <Input
            id={`eta-${option.id}`}
            className="mt-2 rounded-none"
            value={draft.eta}
            onChange={(e) => setDraft({ ...draft, eta: e.target.value })}
          />
        </div>
      </div>
      <Button
        className="mt-4 rounded-none uppercase tracking-[0.14em]"
        disabled={!dirty || saving}
        onClick={() => onSave(draft)}
      >
        <Save className="size-4" /> Save
      </Button>
    </div>
  );
}

function ProductCard({
  product,
  isNew,
  saving,
  onSave,
  onDelete,
  onCancel,
}: {
  product: Product;
  isNew?: boolean;
  saving: boolean;
  onSave: (product: Product) => void;
  onDelete?: () => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState(product);
  const [uploading, setUploading] = useState(false);
  useEffect(() => setDraft(product), [product]);

  const set = <K extends keyof Product>(key: K, value: Product[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const uploadImage = async (file: File) => {
    const slug = (draft.id || "product").replace(/[^a-z0-9-]/g, "");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${slug}/${Date.now()}.${ext}`;
    setUploading(true);
    try {
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (error) throw error;
      set("imageUrl", `/api/public/product-image/${path}`);
      toast.success("Image uploaded — press Save to publish");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-ink bg-background p-5">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div>
          {draft.imageUrl ? (
            <img
              src={draft.imageUrl}
              alt={`${draft.name} preview`}
              className="aspect-2/1 w-full border border-border object-cover"
            />
          ) : (
            <div className="flex aspect-2/1 w-full items-center justify-center border border-dashed border-border text-xs text-muted-foreground">
              No image
            </div>
          )}
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 border border-ink px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] hover:bg-surface-alt">
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {uploading ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadImage(file);
                e.target.value = "";
              }}
            />
          </label>
          <Input
            className="mt-3 rounded-none text-xs"
            placeholder="or paste image URL"
            value={draft.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            aria-label="Image URL"
          />
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Name (EN)</Label>
              <Input
                className="mt-2 rounded-none"
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div>
              <Label>নাম (BN)</Label>
              <Input
                className="mt-2 rounded-none"
                value={draft.nameBn}
                onChange={(e) => set("nameBn", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label>Offer price (৳)</Label>
              <Input
                type="number"
                min={0}
                className="mt-2 rounded-none"
                value={draft.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Regular price (৳)</Label>
              <Input
                type="number"
                min={0}
                className="mt-2 rounded-none"
                value={draft.regularPrice}
                onChange={(e) => set("regularPrice", Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Thickness</Label>
              <Select
                value={draft.thickness}
                onValueChange={(v) => set("thickness", v as Product["thickness"])}
              >
                <SelectTrigger className="mt-2 rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4mm">4mm</SelectItem>
                  <SelectItem value="5mm">5mm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort order</Label>
              <Input
                type="number"
                className="mt-2 rounded-none"
                value={draft.sortOrder}
                onChange={(e) => set("sortOrder", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Description (EN)</Label>
              <Textarea
                className="mt-2 rounded-none"
                rows={2}
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div>
              <Label>বর্ণনা (BN)</Label>
              <Textarea
                className="mt-2 rounded-none"
                rows={2}
                value={draft.descriptionBn}
                onChange={(e) => set("descriptionBn", e.target.value)}
              />
            </div>
          </div>

          {isNew ? (
            <div>
              <Label>Product code (lowercase-dashes)</Label>
              <Input
                className="mt-2 rounded-none"
                placeholder="e.g. neon-city-v2"
                value={draft.id}
                onChange={(e) => set("id", e.target.value.toLowerCase())}
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {formatBdt(draft.price)} · −{discountPercent(draft)}%
            </span>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={draft.active} onCheckedChange={(v) => set("active", v)} />
              Visible on site
            </label>
            <div className="ml-auto flex gap-2">
              {onCancel ? (
                <Button variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              ) : null}
              {onDelete ? (
                <Button variant="outline" className="rounded-none" onClick={onDelete}>
                  <Trash2 className="size-4" /> Delete
                </Button>
              ) : null}
              <Button
                className="rounded-none uppercase tracking-[0.14em]"
                disabled={saving}
                onClick={() => onSave(draft)}
              >
                <Save className="size-4" /> Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
