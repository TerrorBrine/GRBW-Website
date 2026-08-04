import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";
import { Mark } from "@/components/mark";
import { useAdmin } from "@/hooks/use-admin";

const nav = [
  { to: "/", label: "Home" },
  { to: "/unban", label: "Unban Request" },
  { to: "/perks", label: "Perks" },
  { to: "/store", label: "Store" },
  { to: "/links", label: "Links" },
] as const;

export function SiteHeader() {
  const admin = useAdmin();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Mark className="h-8 w-auto" />
          <span className="font-display text-xl font-bold tracking-[0.28em] text-chrome">GRBW</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="px-3 py-2 font-display text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            className="clip-notch hidden items-center gap-2 border border-border px-3 py-2 font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:inline-flex"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {admin ? "Admin on" : "Admin"}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="p-2 text-muted-foreground md:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border/80 bg-card/95 px-4 py-3 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block px-2 py-3 font-display text-sm uppercase tracking-[0.2em] text-muted-foreground data-[status=active]:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className="block px-2 py-3 font-display text-sm uppercase tracking-[0.2em] text-muted-foreground"
          >
            Admin
          </Link>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-card/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-3">
          <Mark className="h-6 w-auto" />
          <span className="font-display text-sm tracking-[0.25em] text-muted-foreground">GRBW</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Ranked Bedwars community · Built for competitive queues
        </p>
      </div>
    </footer>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border/70 bg-[image:var(--gradient-hero)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-14 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-[11px] uppercase tracking-[0.4em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-bold uppercase tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
    </div>
  );
}
