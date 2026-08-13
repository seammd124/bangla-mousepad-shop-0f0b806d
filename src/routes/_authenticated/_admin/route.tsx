import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/is-admin";

export const Route = createFileRoute("/_authenticated/_admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw redirect({ to: "/auth" });

    const isAdmin = await checkIsAdmin(supabase, userData.user.id);
    if (error || !isAdmin) throw redirect({ to: "/" });

    return { isAdmin: true as const };
  },
  component: () => <Outlet />,
});
