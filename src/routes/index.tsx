import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, BadgeCheck, Flame, Truck, Wallet } from "lucide-react";

import { OrderForm } from "@/components/site/OrderForm";
import { OfferBar } from "@/components/site/OfferBar";
import { PriceTag } from "@/components/site/PriceTag";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WaveBackdrop } from "@/components/site/WaveBackdrop";
import {
  MAX_SAVING,
  PRODUCT_SIZE,
  THICKNESS_OPTIONS,
  formatBdt,
  getDesign,
  type DesignId,
} from "@/lib/catalog";
import { DESIGN_IMAGES } from "@/lib/design-images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unipadz — 900×400mm Mousepads | Unique Modz Bangladesh" },
      {
        name: "description",
        content:
          "Order Unipadz oversized desk mousepads: 900×400mm, 4mm ৳1399 or 5mm ৳1799. Cash on delivery all over Bangladesh.",
      },
      { property: "og:title", content: "Unipadz — Premium Desk Mousepads in Bangladesh" },
      {
        property: "og:description",
        content: "9 designs, cash on delivery nationwide. Order in one minute.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TRUST = [
  { icon: Wallet, label: "Cash on delivery", labelBn: "হাতে পেয়ে পেমেন্ট" },
  { icon: Truck, label: "1–5 day delivery", labelBn: "সারা বাংলাদেশে ডেলিভারি" },
  { icon: BadgeCheck, label: "Stitched edges · rubber base", labelBn: "প্রিমিয়াম বিল্ড কোয়ালিটি" },
];

function Index() {
  const [designId, setDesignId] = useState<DesignId>("blood-moon-samurai");
  const design = getDesign(designId);

  return (
    <div id="top" className="min-h-screen bg-background">
      <OfferBar />
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="wave-field relative overflow-hidden border-b border-border">
          <WaveBackdrop />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[1fr_0.9fr] lg:py-20">
            <div className="order-2 lg:order-1">
              <p className="inline-flex items-center gap-2 border border-ink bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground">
                <Flame className="size-3.5" aria-hidden="true" />
                Save up to {formatBdt(MAX_SAVING)}
              </p>
              <h1 className="mt-5 font-display text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
                The desk pad built for{" "}
                <span className="bg-foreground px-2 text-background">your setup</span>
              </h1>
              <p className="bn mt-5 max-w-md text-base text-muted-foreground">
                ৯০০ × ৪০০ মি.মি. প্রিমিয়াম মাউসপ্যাড — ক্যাশ অন ডেলিভারি, সারা বাংলাদেশে।
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a
                  href="#order-form"
                  className="iso-shadow group inline-flex items-center gap-3 border border-ink bg-primary px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px]"
                >
                  Order Now
                  <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
                </a>
                <PriceTag
                  regularPrice={THICKNESS_OPTIONS[0]!.regularPrice}
                  price={THICKNESS_OPTIONS[0]!.price}
                  size="md"
                />
              </div>

              <ul className="mt-8 grid max-w-md gap-3 border-t border-border pt-6 text-sm">
                {TRUST.map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    <item.icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="font-semibold">{item.label}</span>
                    <span className="bn text-muted-foreground">· {item.labelBn}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative order-1 mx-auto w-full max-w-md lg:order-2">
              <div className="iso-shadow border border-ink bg-background p-2">
                <img
                  src={DESIGN_IMAGES[designId]}
                  alt={`${design?.name ?? "Unipadz"} — Unipadz 900×400mm mousepad`}
                  width={1000}
                  height={444}
                  className="aspect-2/1 w-full object-cover"
                />
              </div>
              <span className="absolute -bottom-3 left-4 border border-ink bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground">
                {PRODUCT_SIZE}
              </span>
            </div>
          </div>
        </section>

        {/* Order form */}
        <section id="order-form" className="scroll-mt-24 bg-surface-alt">
          <div className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
            <h2 className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Place your order
            </h2>
            <p className="bn mt-2 text-muted-foreground">
              ডিজাইন বাছুন, তথ্য দিন — আমরা কল করে কনফার্ম করব।
            </p>

            <div className="mt-8">
              <OrderForm designId={designId} onDesignChange={setDesignId} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
