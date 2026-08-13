import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getMetaPixelConfig } from "@/lib/meta.functions";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[] };
    _fbq?: unknown;
  }
}

/** Track a Meta Pixel event from the browser (no-op when the pixel is off). */
export function trackMeta(event: string, params?: Record<string, unknown>, eventId?: string) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, params ?? {}, eventId ? { eventID: eventId } : undefined);
}

export function MetaPixel() {
  const fetchConfig = useServerFn(getMetaPixelConfig);
  const { data } = useQuery({
    queryKey: ["meta-pixel-config"],
    queryFn: () => fetchConfig(),
    staleTime: 5 * 60 * 1000,
  });

  const pixelId = data?.pixelId ?? null;

  useEffect(() => {
    if (!pixelId || typeof window === "undefined") return;
    if (window.fbq) {
      window.fbq("track", "PageView");
      return;
    }

    /* eslint-disable */
    (function (f: any, b: Document, e: string, v: string) {
      let n: any, t: any, s: any;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */

    const fbq = window.fbq as ((...args: unknown[]) => void) | undefined;
    fbq?.("init", pixelId);
    fbq?.("track", "PageView");

  }, [pixelId]);

  if (!pixelId) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        alt=""
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
      />
    </noscript>
  );
}
