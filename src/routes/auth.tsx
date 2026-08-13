import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoLockup } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Unique Modz" },
      { name: "description", content: "Staff sign in for the Unipadz order dashboard." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Sign In — Unique Modz" },
      { property: "og:description", content: "Staff sign in for the Unipadz order dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created", { description: "You can sign in now." });
        setMode("signin");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-alt px-5 py-16">
      <div className="iso-shadow w-full max-w-md border border-ink bg-background p-8">
        <LogoLockup />
        <h1 className="mt-8 font-display text-2xl font-black uppercase tracking-tight">
          {mode === "signin" ? "Admin sign in" : "Create account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Unipadz order dashboard access.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2"
            />
          </div>
          <Button type="submit" disabled={loading} className="h-12 w-full rounded-none uppercase tracking-[0.16em]">
            {mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          className="mt-3 h-12 w-full rounded-none uppercase tracking-[0.16em]"
        >
          Continue with Google
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 w-full text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already registered? Sign in"}
        </button>
      </div>
    </div>
  );
}
