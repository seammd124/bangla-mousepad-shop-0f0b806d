import { discountPercent, formatBdt, savings } from "@/lib/catalog";

interface PriceTagProps {
  regularPrice: number;
  price: number;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  className?: string;
}

const SIZES = {
  sm: { offer: "text-xl", regular: "text-xs" },
  md: { offer: "text-2xl", regular: "text-sm" },
  lg: { offer: "text-4xl", regular: "text-base" },
} as const;

export function PriceTag({
  regularPrice,
  price,
  size = "md",
  showBadge = true,
  className = "",
}: PriceTagProps) {
  const s = SIZES[size];
  const percent = discountPercent({ regularPrice, price });
  const saved = savings({ regularPrice, price });

  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
      <span className={`font-display font-black leading-none ${s.offer}`}>{formatBdt(price)}</span>
      {saved > 0 && (
        <span className={`text-muted-foreground line-through ${s.regular}`}>
          {formatBdt(regularPrice)}
        </span>
      )}
      {showBadge && percent > 0 && (
        <span className="border border-ink bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
          −{percent}%
        </span>
      )}
    </div>
  );
}
