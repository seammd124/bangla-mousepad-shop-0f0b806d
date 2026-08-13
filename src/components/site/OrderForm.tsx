import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useServerFn } from "@tanstack/react-start";
import { Banknote, Check, Copy, Loader2, PhoneCall, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DELIVERY_OPTIONS,
  DESIGNS,
  PRODUCT_SIZE,
  formatBdt,
  getDelivery,
  getDesign,
  savings,
  type DesignId,
} from "@/lib/catalog";
import { DESIGN_IMAGES } from "@/lib/design-images";
import { orderSchema, type OrderInput } from "@/lib/order-schema";
import { placeOrder } from "@/lib/orders.functions";
import { PriceTag } from "@/components/site/PriceTag";

interface OrderFormProps {
  designId: DesignId;
  onDesignChange: (id: DesignId) => void;
}

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-destructive">{message}</p>;
}

export function OrderForm({ designId, onDesignChange }: OrderFormProps) {
  const submitOrder = useServerFn(placeOrder);
  const [confirmation, setConfirmation] = useState<{
    orderNumber: string;
    total: number;
    name: string;
    phone: string;
    design: string;
    thickness: string;
    quantity: number;
    deliveryFee: number;
  } | null>(null);

  const selected = getDesign(designId) ?? DESIGNS[0]!;
  const thickness = selected.thickness;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      phone: "",
      customerName: "",
      address: "",
      city: "",
      area: "",
      postalCode: "",
      designId,
      thickness,
      quantity: 1,
      deliveryArea: "dhaka",
      note: "",
    },
  });

  const quantity = watch("quantity");
  const deliveryArea = watch("deliveryArea");
  const qty = Number(quantity) || 1;

  const unitPrice = selected.price;
  const deliveryFee = getDelivery(deliveryArea)?.fee ?? 0;
  const total = unitPrice * qty + deliveryFee;
  const discount = savings(selected) * qty;

  const selectDesign = (id: DesignId) => {
    onDesignChange(id);
    setValue("designId", id, { shouldValidate: true });
    const next = getDesign(id);
    if (next) setValue("thickness", next.thickness, { shouldValidate: true });
  };

  const onSubmit = async (values: OrderInput) => {
    try {
      const result = await submitOrder({ data: { ...values, designId, thickness } });
      const orderNumber = String(result.orderNumber);
      setConfirmation({
        orderNumber,
        total: result.total,
        name: values.customerName,
        phone: values.phone,
        design: selected.name,
        thickness,
        quantity: qty,
        deliveryFee,
      });
      toast.success(`Order ${orderNumber} placed`, {
        description: "আমরা শীঘ্রই কল করে অর্ডার কনফার্ম করব।",
      });
    } catch (error) {
      toast.error("Order failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  if (confirmation) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="iso-shadow border border-ink bg-card">
          <div className="border-b border-ink bg-primary px-6 py-10 text-center text-primary-foreground sm:px-10">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-primary-foreground/40">
              <Check className="size-7" aria-hidden="true" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">
              Order confirmed
            </h3>
            <p className="bn mt-2 text-sm text-primary-foreground/80">
              ধন্যবাদ {confirmation.name}! আপনার অর্ডারটি আমরা পেয়েছি।
            </p>
            <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-primary-foreground/70">
              Order number
            </p>
            <div className="mt-1 flex items-center justify-center gap-3">
              <p className="font-display text-3xl font-black tracking-tight sm:text-4xl">
                {confirmation.orderNumber}
              </p>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(confirmation.orderNumber);
                  toast.success("Order number copied");
                }}
                className="border border-primary-foreground/40 p-2 transition-colors hover:bg-primary-foreground/10"
                aria-label="Copy order number"
              >
                <Copy className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid gap-px bg-border sm:grid-cols-2">
            <div className="bg-card p-6">
              <p className="eyebrow text-muted-foreground">Your order</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Design</dt>
                  <dd className="font-medium">{confirmation.design}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Size / thickness</dt>
                  <dd className="font-medium">
                    {PRODUCT_SIZE} · {confirmation.thickness}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Quantity</dt>
                  <dd className="font-medium">{confirmation.quantity}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="font-medium">
                    {confirmation.deliveryFee === 0 ? "Free" : formatBdt(confirmation.deliveryFee)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-border pt-2">
                  <dt className="font-bold uppercase">Total</dt>
                  <dd className="font-display text-lg font-black">{formatBdt(confirmation.total)}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-card p-6">
              <p className="eyebrow text-muted-foreground">Payment · পেমেন্ট নির্দেশনা</p>
              <ul className="bn mt-3 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <Banknote className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden="true" />
                  <span>
                    <strong className="text-foreground">ক্যাশ অন ডেলিভারি</strong> — পার্সেল হাতে পেয়ে
                    ডেলিভারি ম্যানকে{" "}
                    <strong className="text-foreground">{formatBdt(confirmation.total)}</strong> পরিশোধ
                    করবেন। অগ্রিম কোনো টাকা লাগবে না।
                  </span>
                </li>
                <li className="flex gap-3">
                  <PhoneCall className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden="true" />
                  <span>
                    আমরা <strong className="text-foreground">{confirmation.phone}</strong> নম্বরে কল করে
                    অর্ডার কনফার্ম করব। ফোন খোলা রাখুন।
                  </span>
                </li>
                <li className="flex gap-3">
                  <Truck className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden="true" />
                  <span>ঢাকায় ১–২ দিন, ঢাকার বাইরে ৩–৫ দিনের মধ্যে ডেলিভারি।</span>
                </li>
              </ul>
              <p className="bn mt-4 text-xs text-muted-foreground">
                যেকোনো প্রয়োজনে কল করুন{" "}
                <a href="tel:+8801990858209" className="font-semibold text-foreground underline">
                  01990-858209
                </a>
              </p>
            </div>
          </div>

          <div className="border-t border-ink p-6 text-center">
            <Button type="button" variant="outline" onClick={() => setConfirmation(null)}>
              Place another order
            </Button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-start"
      noValidate
    >
      <div className="space-y-10">
        <fieldset>
          <legend className="eyebrow text-muted-foreground">01 — Choose design</legend>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DESIGNS.map((design) => {
              const active = design.id === designId;
              return (
                <button
                  type="button"
                  key={design.id}
                  onClick={() => selectDesign(design.id)}
                  aria-pressed={active}
                  className={`group border p-1.5 text-left transition-all ${
                    active
                      ? "iso-shadow-sm -translate-x-[1px] -translate-y-[1px] border-ink"
                      : "border-border hover:border-ink"
                  }`}
                >
                  <img
                    src={DESIGN_IMAGES[design.id]}
                    alt={`${design.name} Unipadz mousepad design`}
                    loading="lazy"
                    className="aspect-2/1 w-full object-cover"
                  />
                  <span className="mt-2 block px-1 text-xs font-bold uppercase tracking-wide">
                    {design.name}
                  </span>
                  <span className="mb-1 block px-1 text-[11px] text-muted-foreground">
                    {design.thickness} · {formatBdt(design.price)}
                  </span>
                </button>
              );
            })}
          </div>
          <FieldError message={errors.designId?.message} />
          <p className="bn mt-3 text-xs text-muted-foreground">
            প্রতিটি ডিজাইনের থিকনেস নির্দিষ্ট — ডিজাইন সিলেক্ট করলেই দাম আপডেট হবে।
          </p>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="eyebrow text-muted-foreground">02 — Your details</legend>


          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="customerName">
                Full name <span className="bn text-muted-foreground">/ নাম</span>
              </Label>
              <Input id="customerName" className="mt-2" {...register("customerName")} />
              <FieldError message={errors.customerName?.message} />
            </div>

            <div>
              <Label htmlFor="phone">
                Phone <span className="bn text-muted-foreground">/ মোবাইল</span>
              </Label>
              <div className="mt-2 flex">
                <span className="flex items-center border border-r-0 border-input bg-surface-alt px-3 text-sm font-semibold">
                  +88
                </span>
                <Input
                  id="phone"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="0181XXXXXXX"
                  className="rounded-l-none"
                  {...register("phone")}
                />
              </div>
              <FieldError message={errors.phone?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="email">
              Email <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input id="email" type="email" className="mt-2" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <Label htmlFor="address">
              Full address <span className="bn text-muted-foreground">/ সম্পূর্ণ ঠিকানা</span>
            </Label>
            <Textarea id="address" rows={3} className="mt-2" {...register("address")} />
            <FieldError message={errors.address?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label htmlFor="city">
                City <span className="bn text-muted-foreground">/ শহর</span>
              </Label>
              <Input id="city" className="mt-2" {...register("city")} />
              <FieldError message={errors.city?.message} />
            </div>
            <div>
              <Label htmlFor="area">
                Area <span className="bn text-muted-foreground">/ এলাকা</span>
              </Label>
              <Input id="area" className="mt-2" {...register("area")} />
              <FieldError message={errors.area?.message} />
            </div>
            <div>
              <Label htmlFor="postalCode">
                Postal code <span className="bn text-muted-foreground">/ পোস্ট কোড</span>
              </Label>
              <Input
                id="postalCode"
                inputMode="numeric"
                maxLength={4}
                className="mt-2"
                {...register("postalCode")}
              />
              <FieldError message={errors.postalCode?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={5}
              className="mt-2 max-w-32"
              {...register("quantity", { valueAsNumber: true })}
            />
            <FieldError message={errors.quantity?.message} />
          </div>

          <div>
            <Label>
              Delivery area <span className="bn text-muted-foreground">/ ডেলিভারি এলাকা</span>
            </Label>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {DELIVERY_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center justify-between border p-3 text-sm transition-colors ${
                    deliveryArea === option.id ? "border-ink bg-surface-alt" : "border-border"
                  }`}
                >
                  <span>
                    <input
                      type="radio"
                      value={option.id}
                      className="sr-only"
                      {...register("deliveryArea")}
                    />
                    <span className="font-semibold">{option.label}</span>
                    <span className="bn ml-2 text-muted-foreground">{option.labelBn}</span>
                  </span>
                  <span className="font-display font-bold">{formatBdt(option.fee)}</span>
                </label>
              ))}
            </div>
          </div>

        </fieldset>
      </div>

      <aside className="iso-shadow top-28 border border-ink bg-card p-6 lg:sticky">
        <h3 className="eyebrow text-muted-foreground">Order summary</h3>
        <img
          src={DESIGN_IMAGES[designId]}
          alt="Selected Unipadz design preview"
          className="mt-4 aspect-2/1 w-full border border-border object-cover"
        />
        <div className="mt-4">
          <PriceTag regularPrice={selected.regularPrice} price={selected.price} size="md" />
        </div>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Design</dt>
            <dd className="font-semibold">
              {selected.name} · {thickness}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Size</dt>
            <dd className="font-semibold">{PRODUCT_SIZE}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Offer price × {qty}</dt>
            <dd className="font-semibold">{formatBdt(unitPrice * qty)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="font-semibold">You save</dt>
              <dd className="font-display font-black">−{formatBdt(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd className="font-semibold">{formatBdt(deliveryFee)}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-baseline justify-between border-t border-ink pt-5">
          <span className="eyebrow">Total</span>
          <span className="font-display text-3xl font-black">{formatBdt(total)}</span>
        </div>
        {discount > 0 && (
          <p className="bn mt-2 text-xs font-semibold">
            আপনি সাশ্রয় করছেন {formatBdt(discount)} — অফার সীমিত সময়ের জন্য।
          </p>
        )}
        <p className="bn mt-2 text-xs text-muted-foreground">
          ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন।
        </p>


        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-14 w-full rounded-none text-sm font-bold uppercase tracking-[0.16em]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Placing order…
            </>
          ) : (
            "Confirm order · অর্ডার করুন"
          )}
        </Button>
      </aside>
    </form>
  );
}
