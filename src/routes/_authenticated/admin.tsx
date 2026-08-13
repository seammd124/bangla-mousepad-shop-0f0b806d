import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogoLockup } from "@/components/site/Logo";
import { formatBdt } from "@/lib/catalog";
import { listOrders, updateOrderStatus } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
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

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchOrders = useServerFn(listOrders);
  const setStatus = useServerFn(updateOrderStatus);

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
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <LogoLockup compact />
          <Button variant="outline" onClick={signOut} className="rounded-none uppercase tracking-[0.14em]">
            Sign out
          </Button>
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

            <div className="mt-8 overflow-x-auto border border-ink bg-background">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="border-b border-ink bg-surface-alt text-left">
                  <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-xs [&>th]:uppercase [&>th]:tracking-[0.14em]">
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Address</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
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
                    </tr>
                  ))}
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                        No orders yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
