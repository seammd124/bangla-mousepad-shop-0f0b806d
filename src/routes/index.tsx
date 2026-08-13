import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, BadgeCheck, Flame, Layers, RotateCcw, Ruler, ShieldCheck, Truck, Wallet } from "lucide-react";

import { OrderForm } from "@/components/site/OrderForm";
import { OfferBar } from "@/components/site/OfferBar";
import { PriceTag } from "@/components/site/PriceTag";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WaveBackdrop } from "@/components/site/WaveBackdrop";
import {
  DESIGNS,
  HEADLINE_DISCOUNT,
  MAX_SAVING,
  PRODUCT_SIZE,
  THICKNESS_OPTIONS,
  formatBdt,
  type DesignId,
} from "@/lib/catalog";
import { DESIGN_IMAGES } from "@/lib/design-images";
import heroVideo from "@/assets/unipadz-hero.mp4.asset.json";
import heroPoster from "@/assets/unipadz-poster.jpg.asset.json";

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
        content: "9 designs, two thicknesses, cash on delivery nationwide. Order in minutes.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FEATURES = [
  {
    icon: Ruler,
    title: "900 × 400mm",
    titleBn: "বিশাল ডেস্ক কভারেজ",
    body: "Covers keyboard, mouse and more — one clean surface for the whole desk.",
  },
  {
    icon: Layers,
    title: "4mm or 5mm",
    titleBn: "দুই ধরনের থিকনেস",
    body: "Pick a low-profile fast glide or a thicker, plush cushioned feel.",
  },
  {
    icon: BadgeCheck,
    title: "Stitched edges",
    titleBn: "সেলাই করা কিনারা",
    body: "Anti-fray stitched borders and a non-slip natural rubber base.",
  },
  {
    icon: Wallet,
    title: "Cash on delivery",
    titleBn: "ক্যাশ অন ডেলিভারি",
    body: "Pay only when the parcel reaches your hand. No advance needed.",
  },
];

function Index() {
  const [designId, setDesignId] = useState<DesignId>("blood-moon-samurai");

  return (
    <div id="top" className="min-h-screen bg-background">
      <OfferBar />
      <SiteHeader />


      <main>
        {/* Hero */}
        <section className="wave-field relative overflow-hidden border-b border-border">
          <WaveBackdrop />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-24">
            <div className="order-2 lg:order-1">
              <p className="eyebrow text-muted-foreground">Unique Modz · Unipadz</p>
              <p className="mt-4 inline-flex items-center gap-2 border border-ink bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground">
                <Flame className="size-3.5" aria-hidden="true" />
                Launch offer · save up to {formatBdt(MAX_SAVING)}
              </p>
              <h1 className="mt-5 font-display text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
                The desk pad
                <br />
                built for
                <br />
                <span className="bg-foreground px-2 text-background">your setup</span>
              </h1>
              <p className="bn mt-6 max-w-md text-lg text-muted-foreground">
                ৯০০ × ৪০০ মি.মি. প্রিমিয়াম মাউসপ্যাড — ৯টি ডিজাইন, ৪ ও ৫ মি.মি. থিকনেস, সারা
                বাংলাদেশে ক্যাশ অন ডেলিভারি।
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#order-form"
                  className="iso-shadow group inline-flex items-center gap-3 border border-ink bg-primary px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px]"
                >
                  Order Now
                  <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
                </a>
                <div>
                  <PriceTag
                    regularPrice={THICKNESS_OPTIONS[0]!.regularPrice}
                    price={THICKNESS_OPTIONS[0]!.price}
                    size="md"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    starting price · offer ends soon
                  </p>
                </div>
              </div>


              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6 text-sm">
                <div>
                  <dt className="text-muted-foreground">Size</dt>
                  <dd className="font-display font-bold">{PRODUCT_SIZE}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Designs</dt>
                  <dd className="font-display font-bold">9 options</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="font-display font-bold">1–5 days</dd>
                </div>
              </dl>
            </div>

            <div className="relative order-1 mx-auto w-full max-w-xs sm:max-w-sm lg:order-2 lg:max-w-md">
              <div className="iso-shadow border border-ink bg-background p-2">
                <video
                  src={heroVideo.url}
                  poster={heroPoster.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Unipadz mousepad product video"
                  className="aspect-9/16 w-full object-cover"
                />
              </div>
              <span className="absolute -bottom-3 left-4 border border-ink bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground">
                {PRODUCT_SIZE}
              </span>
            </div>
          </div>
        </section>

        {/* Features / specs */}
        <section id="specs" className="border-b border-border bg-surface-alt">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <p className="eyebrow text-muted-foreground">Specifications</p>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Built to survive the daily grind
            </h2>
            <div className="mt-10 grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="bg-background p-6">
                  <feature.icon className="size-6" aria-hidden="true" />
                  <h3 className="mt-4 font-display text-lg font-black uppercase">{feature.title}</h3>
                  <p className="bn text-sm text-muted-foreground">{feature.titleBn}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{feature.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {THICKNESS_OPTIONS.map((option) => (
                <div key={option.id} className="flex items-center justify-between gap-4 border border-ink bg-background p-6">
                  <div>
                    <p className="font-display text-2xl font-black">
                      {PRODUCT_SIZE} · {option.label}
                    </p>
                    <p className="bn mt-1 text-sm text-muted-foreground">{option.blurbBn}</p>
                  </div>
                  <PriceTag regularPrice={option.regularPrice} price={option.price} size="lg" />
                </div>
              ))}
            </div>

            {/* Trust strip */}
            <div className="mt-10 grid gap-px border border-ink bg-ink sm:grid-cols-3">
              <p className="flex items-center gap-3 bg-background p-5 text-sm font-semibold">
                <Wallet className="size-5" aria-hidden="true" /> Cash on delivery nationwide
              </p>
              <p className="flex items-center gap-3 bg-background p-5 text-sm font-semibold">
                <RotateCcw className="size-5" aria-hidden="true" /> 7-day replacement guarantee
              </p>
              <p className="flex items-center gap-3 bg-background p-5 text-sm font-semibold">
                <ShieldCheck className="size-5" aria-hidden="true" /> Limited launch stock
              </p>
            </div>
          </div>
        </section>

        {/* Designs */}
        <section id="designs" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <p className="eyebrow text-muted-foreground">The lineup</p>
            <h2 className="mt-4 font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Nine designs. Up to {HEADLINE_DISCOUNT}% off.
            </h2>
            <p className="bn mt-2 text-muted-foreground">
              পছন্দের ডিজাইনে ট্যাপ করুন — অর্ডার ফর্মে সেটি সিলেক্ট হয়ে যাবে।
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {DESIGNS.map((design) => {
                const active = design.id === designId;
                return (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => {
                      setDesignId(design.id);
                      document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`group border p-2 text-left transition-all ${
                      active
                        ? "iso-shadow -translate-x-[2px] -translate-y-[2px] border-ink"
                        : "border-border hover:iso-shadow hover:-translate-x-[2px] hover:-translate-y-[2px] hover:border-ink"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={DESIGN_IMAGES[design.id]}
                        alt={`${design.name} — Unipadz mousepad design`}
                        loading="lazy"
                        width={1000}
                        height={444}
                        className="aspect-2/1 w-full object-cover"
                      />
                      <span className="absolute left-2 top-2 border border-ink bg-background px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">
                        {design.thickness}
                      </span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-display text-lg font-black uppercase">{design.name}</h3>
                      <p className="bn text-sm text-muted-foreground">{design.nameBn}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{design.description}</p>
                      <PriceTag
                        className="mt-3"
                        regularPrice={design.regularPrice}
                        price={design.price}
                        size="sm"
                      />
                    </div>
                  </button>

                );
              })}
            </div>
          </div>
        </section>

        {/* Delivery */}
        <section id="delivery" className="border-b border-border bg-foreground text-background">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:grid-cols-3">
            <div>
              <Truck className="size-6" aria-hidden="true" />
              <h2 className="mt-4 font-display text-xl font-black uppercase">Inside Dhaka</h2>
              <p className="mt-2 text-sm text-background/70">৳60 delivery · 1–2 working days</p>
            </div>
            <div>
              <Truck className="size-6" aria-hidden="true" />
              <h3 className="mt-4 font-display text-xl font-black uppercase">Outside Dhaka</h3>
              <p className="mt-2 text-sm text-background/70">৳120 delivery · 3–5 working days</p>
            </div>
            <div>
              <Wallet className="size-6" aria-hidden="true" />
              <h3 className="mt-4 font-display text-xl font-black uppercase">Cash on delivery</h3>
              <p className="bn mt-2 text-sm text-background/70">
                পণ্য হাতে পেয়ে টাকা পরিশোধ করুন।
              </p>
            </div>
          </div>
        </section>

        {/* Order form */}
        <section id="order-form" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
            <p className="eyebrow text-muted-foreground">Order form</p>
            <h2 className="mt-4 font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Place your order
            </h2>
            <p className="bn mt-2 text-muted-foreground">
              তথ্যগুলো পূরণ করুন — আমরা কল করে অর্ডার কনফার্ম করব।
            </p>

            <div className="mt-10">
              <OrderForm designId={designId} onDesignChange={setDesignId} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
