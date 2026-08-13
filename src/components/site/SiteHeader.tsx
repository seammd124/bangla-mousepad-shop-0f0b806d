import { LogoLockup } from "./Logo";

const NAV = [
  { href: "#designs", label: "Designs" },
  { href: "#specs", label: "Specifications" },
  { href: "#delivery", label: "Delivery" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
        <a href="#top" aria-label="Unique Modz home">
          <LogoLockup />
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#order-form"
          className="iso-shadow-sm inline-flex items-center border border-ink bg-primary px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] sm:px-6"
        >
          Order Now
          <span className="bn ml-2 hidden font-medium normal-case tracking-normal sm:inline">
            এখনই কিনুন
          </span>
        </a>
      </div>
    </header>
  );
}
