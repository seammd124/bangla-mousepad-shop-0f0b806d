import { Facebook, Mail, MapPin, Phone, Youtube } from "lucide-react";

import { LogoLockup } from "./Logo";
import { CONTACT } from "@/lib/contact";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-3">
        <div>
          <div className="[&_img]:invert [&_.text-muted-foreground]:text-background/60">
            <LogoLockup />
          </div>
          <p className="mt-6 max-w-xs text-sm text-background/70">
            Unipadz — oversized desk mousepads built in Bangladesh for people who care about
            their setup.
          </p>
          <p className="bn mt-3 max-w-xs text-sm text-background/60">
            বাংলাদেশে তৈরি প্রিমিয়াম বড় মাউসপ্যাড।
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg font-black uppercase tracking-wide">Contact Us</h2>
          <ul className="mt-6 space-y-4 text-sm text-background/70">
            <li className="flex items-center gap-3">
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              <a href={`tel:${CONTACT.phoneE164}`} className="hover:text-background">
                {CONTACT.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <a href={`mailto:${CONTACT.email}`} className="hover:text-background">
                {CONTACT.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Facebook className="size-4 shrink-0" aria-hidden="true" />
              <span>{CONTACT.facebook}</span>
            </li>
            <li className="flex items-center gap-3">
              <Youtube className="size-4 shrink-0" aria-hidden="true" />
              <span>{CONTACT.youtube}</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{CONTACT.address}</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg font-black uppercase tracking-wide">Support</h2>
          <ul className="mt-6 space-y-3 text-sm text-background/70">
            <li>
              <a href="#order-form" className="hover:text-background">
                Place an order
              </a>
            </li>
            <li>Cash on Delivery nationwide</li>
          </ul>

        </div>
      </div>

      <div className="border-t border-background/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs uppercase tracking-[0.18em] text-background/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Unique Modz</span>
          <span>Made in Bangladesh</span>
        </div>
      </div>
    </footer>
  );
}
