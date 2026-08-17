import logoUrl from "@/assets/um-logo.jpg";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <img
      src={logoUrl}

      alt="Unique Modz monogram"
      width={64}
      height={64}
      className={`${className} object-contain dark:invert`}
    />
  );
}

export function LogoLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark className={compact ? "h-8 w-8" : "h-10 w-10"} />
      <div className="leading-none">
        <div className="font-display text-base font-black uppercase tracking-[0.18em]">
          Unique Modz
        </div>
        <div className="mt-1 text-[0.6rem] uppercase tracking-[0.32em] text-muted-foreground">
          Unipadz
        </div>
      </div>
    </div>
  );
}
