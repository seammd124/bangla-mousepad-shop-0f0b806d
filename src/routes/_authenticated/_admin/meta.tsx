import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LogoLockup } from "@/components/site/Logo";
import {
  adminClearMetaToken,
  adminGetMetaSettings,
  adminSaveMetaSettings,
} from "@/lib/meta.functions";

export const Route = createFileRoute("/_authenticated/_admin/meta")({
  head: () => ({
    meta: [
      { title: "Meta Ads Tracking — Unique Modz" },
      {
        name: "description",
        content: "Configure the Meta Pixel and Conversions API for Unipadz ad campaigns.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Meta Ads Tracking — Unique Modz" },
      { property: "og:description", content: "Pixel and Conversions API settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MetaSettingsPage,
});

function MetaSettingsPage() {
  const queryClient = useQueryClient();
  const load = useServerFn(adminGetMetaSettings);
  const save = useServerFn(adminSaveMetaSettings);
  const clearToken = useServerFn(adminClearMetaToken);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-meta-settings"],
    queryFn: () => load(),
  });

  const [pixelId, setPixelId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [testEventCode, setTestEventCode] = useState("");
  const [pixelEnabled, setPixelEnabled] = useState(false);
  const [capiEnabled, setCapiEnabled] = useState(false);

  useEffect(() => {
    if (!data) return;
    setPixelId(data.pixelId);
    setTestEventCode(data.testEventCode);
    setPixelEnabled(data.pixelEnabled);
    setCapiEnabled(data.capiEnabled);
    setAccessToken("");
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      save({ data: { pixelId, accessToken, testEventCode, pixelEnabled, capiEnabled } }),
    onSuccess: () => {
      toast.success("Meta settings saved");
      queryClient.invalidateQueries({ queryKey: ["admin-meta-settings"] });
      queryClient.invalidateQueries({ queryKey: ["meta-pixel-config"] });
    },
    onError: (err: Error) => toast.error(err.message || "Could not save"),
  });

  const clearMutation = useMutation({
    mutationFn: () => clearToken(),
    onSuccess: () => {
      toast.success("Access token removed");
      queryClient.invalidateQueries({ queryKey: ["admin-meta-settings"] });
    },
    onError: () => toast.error("Could not remove token"),
  });

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:py-5">
          <LogoLockup />
          <nav className="flex items-center gap-2">
            <Button asChild variant="outline" className="rounded-none uppercase tracking-[0.14em]">
              <Link to="/admin">Orders</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-none uppercase tracking-[0.14em]">
              <Link to="/catalog">Catalog</Link>
            </Button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight">
            Meta Ads Tracking
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Meta Pixel (browser) আর Conversions API (server) — দুটোই এখান থেকে চালু/বন্ধ করা যাবে।
            একই অর্ডারের ইভেন্ট দুই জায়গা থেকে গেলেও Meta সেটি event ID দিয়ে ডিডুপ্লিকেট করে নেয়।
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <>
            <section className="space-y-5 border border-border p-6">
              <h2 className="font-display text-lg font-black uppercase tracking-tight">Pixel</h2>
              <div className="space-y-2">
                <Label htmlFor="pixel-id">Pixel ID</Label>
                <Input
                  id="pixel-id"
                  inputMode="numeric"
                  placeholder="1234567890123456"
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                  className="rounded-none"
                />
                <p className="text-xs text-muted-foreground">
                  Events Manager → Data Sources থেকে Pixel ID কপি করুন।
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-sm font-medium">Browser pixel চালু</p>
                  <p className="text-xs text-muted-foreground">
                    PageView, InitiateCheckout ও Purchase ইভেন্ট পাঠাবে।
                  </p>
                </div>
                <Switch checked={pixelEnabled} onCheckedChange={setPixelEnabled} />
              </div>
            </section>

            <section className="space-y-5 border border-border p-6">
              <h2 className="font-display text-lg font-black uppercase tracking-tight">
                Conversions API
              </h2>
              <div className="space-y-2">
                <Label htmlFor="access-token">Access token</Label>
                <Input
                  id="access-token"
                  type="password"
                  autoComplete="off"
                  placeholder={data?.hasToken ? `Saved (${data.tokenHint}) — নতুন দিলে বদলে যাবে` : "EAAG..."}
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="rounded-none"
                />
                <p className="text-xs text-muted-foreground">
                  টোকেন সার্ভারেই থাকে, ওয়েবসাইটে কখনো দেখানো হয় না।
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-code">Test event code (optional)</Label>
                <Input
                  id="test-code"
                  placeholder="TEST12345"
                  value={testEventCode}
                  onChange={(e) => setTestEventCode(e.target.value)}
                  className="rounded-none"
                />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-sm font-medium">Server-side Purchase পাঠাও</p>
                  <p className="text-xs text-muted-foreground">
                    অর্ডার সেভ হওয়ার সাথে সাথে Meta-তে Purchase ইভেন্ট যাবে।
                  </p>
                </div>
                <Switch checked={capiEnabled} onCheckedChange={setCapiEnabled} />
              </div>
              {data?.hasToken ? (
                <Button
                  variant="outline"
                  className="rounded-none uppercase tracking-[0.14em]"
                  onClick={() => clearMutation.mutate()}
                  disabled={clearMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Remove token
                </Button>
              ) : null}
            </section>

            <Button
              className="rounded-none uppercase tracking-[0.14em]"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save settings
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
