import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, Eye, Phone, MessageCircle, Copy, Download, Calendar } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { LogoLockup } from "@/components/site/Logo";
import { formatBdt } from "@/lib/catalog";
import { listOrders, updateOrderStatus } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/_admin/admin")({
  head: () => ({
    meta: [
      { title: "Orders Dashboard — Unique Modz" },
      { name: "description", content: "Internal Unipadz cash-on-delivery order dashboard." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Orders Dashboard — Unique Modz" },
      { property: "og:description", content: "Internal Unipadz order dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"];

const EXPORT_COLUMNS: { key: string; label: string }[] = [
  { key: "order_number", label: "Order No" },
  { key: "created_at", label: "Date" },
  { key: "status", label: "Status" },
  { key: "customer_name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "area", label: "Area" },
  { key: "city", label: "City" },
  { key: "postal_code", label: "Postal Code" },
  { key: "country", label: "Country" },
  { key: "design_name", label: "Design" },
  { key: "thickness", label: "Thickness" },
  { key: "quantity", label: "Qty" },
  { key: "unit_price", label: "Unit Price" },
  { key: "delivery_area", label: "Delivery Area" },
  { key: "delivery_fee", label: "Delivery Fee" },
  { key: "total", label: "Total" },
  { key: "note", label: "Note" },
];

const EXPORT_PREFS_KEY = "unipadz-export-columns";

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchOrders = useServerFn(listOrders);
  const setStatus = useServerFn(updateOrderStatus);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportKeys, setExportKeys] = useState<string[]>(() =>
    EXPORT_COLUMNS.map((c) => c.key),
  );

  useEffect(() => {
    const saved = localStorage.getItem(EXPORT_PREFS_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as string[];
      const valid = parsed.filter((k) => EXPORT_COLUMNS.some((c) => c.key === k));
      if (valid.length) setExportKeys(valid);
    } catch {
      /* ignore malformed prefs */
    }
  }, []);

  const toggleExportKey = (key: string, checked: boolean) => {
    setExportKeys((prev) => {
      const next = checked ? [...prev, key] : prev.filter((k) => k !== key);
      localStorage.setItem(EXPORT_PREFS_KEY, JSON.stringify(next));
      return next;
    });
  };



  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => fetchOrders(),
  });

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: string }) => setStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => toast.error("Could not update status"),
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const orders = data?.orders ?? [];
  const selected = orders.find((o) => o.id === selectedId) ?? null;
  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return [
        o.order_number,
        o.customer_name,
        o.phone,
        o.email,
        o.city,
        o.area,
        o.address,
        o.design_name,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [orders, query, statusFilter]);

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.error("No orders to export");
      return;
    }
    const columns = EXPORT_COLUMNS.filter((c) => exportKeys.includes(c.key));
    if (columns.length === 0) {
      toast.error("Select at least one column");
      return;
    }
    const escape = (value: unknown) => {
      const s = value === null || value === undefined ? "" : String(value);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const rows = filtered.map((o) =>
      columns.map((c) => escape((o as Record<string, unknown>)[c.key])).join(","),
    );
    const csv = ["\uFEFF" + columns.map((c) => escape(c.label)).join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unipadz-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
    toast.success(`${filtered.length} orders exported`);
  };



  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <LogoLockup compact />
          <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="rounded-none uppercase tracking-[0.14em]">
            <Link to="/catalog">Catalog</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setExportOpen(true)}
            className="rounded-none uppercase tracking-[0.14em]"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>

          <Dialog open={exportOpen} onOpenChange={setExportOpen}>
            <DialogContent className="max-w-lg rounded-none border-ink">
              <DialogHeader>
                <DialogTitle className="font-display uppercase tracking-tight">
                  Export columns
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Choose which columns to include. {filtered.length} order(s) match the current
                filters.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  onClick={() => {
                    const all = EXPORT_COLUMNS.map((c) => c.key);
                    setExportKeys(all);
                    localStorage.setItem(EXPORT_PREFS_KEY, JSON.stringify(all));
                  }}
                >
                  Select all
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  onClick={() => {
                    setExportKeys([]);
                    localStorage.setItem(EXPORT_PREFS_KEY, JSON.stringify([]));
                  }}
                >
                  Clear all
                </Button>
              </div>
              <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto border border-border p-3">
                {EXPORT_COLUMNS.map((c) => (
                  <label key={c.key} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={exportKeys.includes(c.key)}
                      onCheckedChange={(v) => toggleExportKey(c.key, v === true)}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
              <Button onClick={exportCsv} className="rounded-none uppercase tracking-[0.14em]">
                <Download className="mr-2 h-4 w-4" /> Download CSV
              </Button>
            </DialogContent>
          </Dialog>


          <Button variant="outline" onClick={signOut} className="rounded-none uppercase tracking-[0.14em]">
            Sign out
          </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">Orders</h1>

        {isLoading ? (
          <p className="mt-8 text-muted-foreground">Loading orders…</p>
        ) : data && !data.isAdmin ? (
          <div className="mt-8 border border-ink bg-background p-8">
            <h2 className="font-display text-xl font-black uppercase">No admin access</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This account does not have the admin role yet. Ask an existing admin to grant it.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="border border-ink bg-background p-5">
                <p className="eyebrow text-muted-foreground">Total orders</p>
                <p className="mt-2 font-display text-3xl font-black">{orders.length}</p>
              </div>
              <div className="border border-ink bg-background p-5">
                <p className="eyebrow text-muted-foreground">New</p>
                <p className="mt-2 font-display text-3xl font-black">
                  {orders.filter((o) => o.status === "new").length}
                </p>
              </div>
              <div className="border border-ink bg-background p-5">
                <p className="eyebrow text-muted-foreground">Order value</p>
                <p className="mt-2 font-display text-3xl font-black">{formatBdt(revenue)}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search order no, name, phone, city, design…"
                  className="rounded-none pl-9"
                  aria-label="Search orders"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full rounded-none sm:w-[180px]" aria-label="Filter by status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Showing {filtered.length} of {orders.length}
            </p>

            <div className="mt-4 overflow-x-auto border border-ink bg-background">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="border-b border-ink bg-surface-alt text-left">
                  <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-xs [&>th]:uppercase [&>th]:tracking-[0.14em]">
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Address</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th className="text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 [&>td]:px-4 [&>td]:py-4 [&>td]:align-top">
                      <td>
                        <span className="font-display font-bold">#{order.order_number}</span>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleString("en-GB")}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold">{order.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{order.phone}</div>
                        {order.email ? (
                          <div className="text-xs text-muted-foreground">{order.email}</div>
                        ) : null}
                      </td>
                      <td>
                        <div>{order.design_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.thickness} × {order.quantity}
                        </div>
                      </td>
                      <td className="max-w-[240px]">
                        <div>{order.address}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.area}, {order.city} — {order.postal_code}
                        </div>
                      </td>
                      <td className="font-display font-bold">{formatBdt(Number(order.total))}</td>
                      <td>
                        <Select
                          value={order.status}
                          onValueChange={(value) => mutation.mutate({ id: order.id, status: value })}
                        >
                          <SelectTrigger className="w-[140px] rounded-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none"
                          onClick={() => setSelectedId(order.id)}
                        >
                          <Eye className="size-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                        {orders.length === 0 ? "No orders yet." : "No orders match your search."}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-none border-ink sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-black uppercase tracking-tight">
                  Order #{selected.order_number}
                </DialogTitle>
              </DialogHeader>

              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {new Date(selected.created_at).toLocaleString("en-GB")}
              </p>

              <div className="mt-2 space-y-4 text-sm">
                <section className="border border-border p-4">
                  <p className="eyebrow text-muted-foreground">Customer</p>
                  <p className="mt-2 font-semibold">{selected.customer_name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span>{selected.phone}</span>
                    <button
                      type="button"
                      onClick={() => copy("Phone", selected.phone)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Copy phone"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                  {selected.email ? (
                    <p className="mt-1 text-muted-foreground">{selected.email}</p>
                  ) : null}
                  <div className="mt-3 flex gap-2">
                    <Button asChild size="sm" variant="outline" className="rounded-none">
                      <a href={`tel:${selected.phone}`}>
                        <Phone className="size-4" /> Call
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="rounded-none">
                      <a
                        href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="size-4" /> WhatsApp
                      </a>
                    </Button>
                  </div>
                </section>

                <section className="border border-border p-4">
                  <p className="eyebrow text-muted-foreground">Delivery address</p>
                  <p className="mt-2">{selected.address}</p>
                  <p className="text-muted-foreground">
                    {selected.area}, {selected.city} — {selected.postal_code}
                  </p>
                  <p className="text-muted-foreground">{selected.country}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 rounded-none"
                    onClick={() =>
                      copy(
                        "Address",
                        `${selected.customer_name}, ${selected.phone}, ${selected.address}, ${selected.area}, ${selected.city} - ${selected.postal_code}`,
                      )
                    }
                  >
                    <Copy className="size-4" /> Copy full address
                  </Button>
                </section>

                <section className="border border-border p-4">
                  <p className="eyebrow text-muted-foreground">Product</p>
                  <p className="mt-2 font-semibold">{selected.design_name}</p>
                  <p className="text-muted-foreground">
                    {selected.thickness} · Qty {selected.quantity}
                  </p>
                  <dl className="mt-3 space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Unit price</dt>
                      <dd>{formatBdt(Number(selected.unit_price))}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">
                        Delivery ({selected.delivery_area === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"})
                      </dt>
                      <dd>{formatBdt(Number(selected.delivery_fee))}</dd>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 font-display font-black">
                      <dt>Total (COD)</dt>
                      <dd>{formatBdt(Number(selected.total))}</dd>
                    </div>
                  </dl>
                </section>

                {selected.note ? (
                  <section className="border border-border p-4">
                    <p className="eyebrow text-muted-foreground">Note</p>
                    <p className="mt-2">{selected.note}</p>
                  </section>
                ) : null}

                <section className="border border-border p-4">
                  <p className="eyebrow text-muted-foreground">Status</p>
                  <Select
                    value={selected.status}
                    onValueChange={(value) => mutation.mutate({ id: selected.id, status: value })}
                  >
                    <SelectTrigger className="mt-2 rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </section>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
