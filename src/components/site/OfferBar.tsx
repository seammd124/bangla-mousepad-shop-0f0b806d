import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

import { HEADLINE_DISCOUNT, MAX_SAVING, formatBdt } from "@/lib/catalog";

function msUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function OfferBar() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    setRemaining(msUntilMidnight());
    const timer = window.setInterval(() => setRemaining(msUntilMidnight()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totalSeconds = Math.max(0, Math.floor((remaining ?? 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="border-b border-ink bg-foreground text-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-5 py-2 text-center text-xs sm:text-sm">
        <span className="inline-flex items-center gap-2 font-bold uppercase tracking-[0.14em]">
          <Flame className="size-4" aria-hidden="true" />
          Launch offer −{HEADLINE_DISCOUNT}%
        </span>
        <span className="bn text-background/80">
          সর্বোচ্চ {formatBdt(MAX_SAVING)} পর্যন্ত ছাড় — সীমিত সময়ের জন্য
        </span>
        <span className="font-display font-black tabular-nums" aria-live="off">
          {remaining === null ? "--:--:--" : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`}
        </span>
      </div>
    </div>
  );
}
