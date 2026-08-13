import { Flame, Truck } from "lucide-react";

import { HEADLINE_DISCOUNT, MAX_SAVING, formatBdt } from "@/lib/catalog";

export function OfferBar() {
  return (
    <div className="border-b border-ink bg-foreground text-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-5 py-2 text-center text-xs sm:text-sm">
        <span className="inline-flex items-center gap-2 font-bold uppercase tracking-[0.14em]">
          <Flame className="size-4" aria-hidden="true" />
          Launch offer −{HEADLINE_DISCOUNT}%
        </span>
        <span className="bn text-background/80">
          প্রথম ব্যাচের সীমিত স্টক — সর্বোচ্চ {formatBdt(MAX_SAVING)} পর্যন্ত ছাড়
        </span>
        <span className="inline-flex items-center gap-1.5 text-background/80">
          <Truck className="size-3.5" aria-hidden="true" />
          <span className="bn">ক্যাশ অন ডেলিভারি, সারা বাংলাদেশে</span>
        </span>
      </div>
    </div>
  );
}
