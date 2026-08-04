import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeading } from "@/components/site-chrome";
import { useAdmin } from "@/hooks/use-admin";
import { adminLogin, adminLogout } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — GRBW" },
      {
        name: "description",
        content: "Admin access for GRBW staff to publish videos, perks, store items and links.",
      },
      { property: "og:title", content: "Admin — GRBW" },
      { property: "og:description", content: "GRBW staff area." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const admin = useAdmin();
  const queryClient = useQueryClient();
  const login = useServerFn(adminLogin);
  const logout = useServerFn(adminLogout);
  const [busy, setBusy] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    setBusy(true);
    try {
      const result = await login({ data: { password } });
      if (result.ok) {
        await queryClient.invalidateQueries({ queryKey: ["admin-status"] });
        toast.success("Admin mode enabled");
      } else if (result.reason === "unconfigured") {
        toast.error("No admin password has been set up yet");
      } else {
        toast.error("Incorrect password");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Staff"
        title="Admin access"
        description="Unlock the '+' buttons across Home, Perks, Store and Links, plus unban request reviews."
      />

      <section className="mx-auto max-w-md px-4 py-16">
        {admin ? (
          <div className="surface-steel clip-notch p-8 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-4 font-display text-sm uppercase tracking-[0.2em]">Admin mode is on</p>
            <p className="mt-2 text-sm text-muted-foreground">
              The '+' buttons are now visible on every page.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await logout({});
                  await queryClient.invalidateQueries({ queryKey: ["admin-status"] });
                  toast.success("Signed out");
                } finally {
                  setBusy(false);
                }
              }}
              className="clip-notch mt-6 w-full border border-border px-5 py-3 font-display text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
            >
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="surface-steel clip-notch p-8">
            <label className="block">
              <span className="font-display text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Admin password
              </span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 w-full border border-input bg-background/60 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="clip-notch mt-6 w-full bg-primary px-5 py-3 font-display text-xs uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Unlock admin mode
            </button>
          </form>
        )}
      </section>
    </>
  );
}
