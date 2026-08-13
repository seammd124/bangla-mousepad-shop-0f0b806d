import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, BadgeCheck, Flame, Truck, Wallet } from "lucide-react";

import { OrderForm } from "@/components/site/OrderForm";
import { OfferBar } from "@/components/site/OfferBar";
import { PriceTag } from "@/components/site/PriceTag";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WaveBackdrop } from "@/components/site/WaveBackdrop";
import { formatBdt, maxDiscountPercent, maxSaving } from "@/lib/catalog";
import { getStorefront } from "@/lib/catalog.functions";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unipadz — Bangladesh's #1 Premium Desk Mousepad | ৳1399 Only" },
      {
        name: "description",
        content:
          "Unipadz — 900×400mm premium mousepad. 9 designs, COD nationwide, up to ৳500 off. Order in 1 minute.",
      },
      { property: "og:title", content: "Unipadz — Bangladesh's #1 Premium Desk Mousepad" },
      {
        property: "og:description",
        content: "9 designs, cash on delivery nationwide. Up to ৳500 launch discount. Order in 1 minute.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: () => getStorefront(),
  errorComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-5 text-center">
      <p className="bn text-muted-foreground">দুঃখিত, পেজটি লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
  component: Index,
});

const TRUST = [
  { icon: Wallet, label: "Cash on delivery", labelBn: "হাতে পেয়ে পেমেন্ট" },
  { icon: Truck, label: "1–5 day delivery", labelBn: "সারা বাংলাদেশে ডেলিভারি" },
  { icon: BadgeCheck, label: "Stitched edges · rubber base", labelBn: "প্রিমিয়াম বিল্ড কোয়ালিটি" },
];

function Index() {
  const { products, delivery } = Route.useLoaderData();
  const [designId, setDesignId] = useState<string>(products[0]?.id ?? "");
  const saving = maxSaving(products);
  const discount = maxDiscountPercent(products);
  const cheapest = products.reduce<(typeof products)[number] | undefined>(
    (best, p) => (!best || p.price < best.price ? p : best),
    undefined,
  );
  

  return (
    <div id="top" className="min-h-screen bg-background">
      <OfferBar discount={discount} saving={saving} />
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="wave-field relative overflow-hidden border-b border-border">
          <WaveBackdrop />
          <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-5 sm:py-16 lg:py-24">
            <p className="inline-flex items-center gap-2 border border-ink bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground">
              <Flame className="size-3.5" aria-hidden="true" />
              Launch offer — save up to {formatBdt(saving)}
            </p>

            <h1 className="mt-6 font-display text-[2.1rem] font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Your desk deserves{" "}
              <span className="bg-foreground px-2 text-background">better</span>
            </h1>

            <p className="bn-display mx-auto mt-5 max-w-xl text-lg text-foreground/90 sm:mt-6 sm:text-2xl">
              ৯০০ × ৪০০ মি.মি. প্রিমিয়াম মাউসপ্যাড — নিখুঁত গ্লাইড, নিঃশব্দ কন্ট্রোল, আর ডেস্কের
              চেহারাই বদলে দেওয়া ফিনিশ।

            </p>

            <p className="bn mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
              প্রথম ব্যাচের সীমিত স্টক — লঞ্চ অফার চলবে স্টক থাকা পর্যন্ত। অর্ডার করতে
              লাগবে মাত্র ১ মিনিট, ক্যাশ অন ডেলিভারি, সারা বাংলাদেশে।
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-5 sm:mt-9 sm:flex-row">
              <a
                href="#order-form"
                className="iso-shadow group inline-flex w-full items-center justify-center gap-3 border border-ink bg-primary px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] sm:w-auto sm:px-9"
              >
                Order Now
                <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
              </a>

              {cheapest ? (
                <PriceTag regularPrice={cheapest.regularPrice} price={cheapest.price} size="md" />
              ) : null}
            </div>

            <ul className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-4 border-t border-border pt-6 text-sm sm:grid-cols-3">
              {TRUST.map((item) => (
                <li key={item.label} className="flex flex-col items-center gap-1">
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="font-semibold">{item.label}</span>
                  <span className="bn text-xs text-muted-foreground">{item.labelBn}</span>
                </li>
              ))}
            </ul>

          </div>
        </section>


        {/* Order form */}
        <section id="order-form" className="scroll-mt-20 bg-surface-alt">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-14 lg:py-20">
            <h2 className="font-display text-2xl font-black uppercase tracking-tight sm:text-4xl">
              Place your order
            </h2>
            <p className="bn-display mt-3 max-w-xl text-base sm:text-lg">
              ডিজাইন বেছে নিন, তথ্য দিন — বাকিটা আমাদের দায়িত্ব।
            </p>

            <p className="bn mt-1 max-w-xl text-sm text-muted-foreground">
              অর্ডারের পর আমরা কল করে কনফার্ম করব। টাকা দিবেন পণ্য হাতে পাওয়ার পর।
            </p>


            <div className="mt-8">
              <OrderForm
                designId={designId}
                onDesignChange={setDesignId}
                products={products}
                delivery={delivery}
              />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
