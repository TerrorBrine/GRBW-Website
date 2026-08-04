import { useState } from "react";
import { ExternalLink, ShieldCheck, Ticket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type PurchaseTarget = {
  title: string;
  price?: string | null;
  price_usd?: string | null;
  price_inr?: string | null;
  paypal_url?: string | null;
  gpay_url?: string | null;
  purchase_url?: string | null;
  ticket_url?: string | null;
};

type Method = "paypal" | "gpay";

const METHODS: { id: Method; label: string; blurb: string; currency: string }[] = [
  { id: "paypal", label: "PayPal", blurb: "International card & balance", currency: "USD" },
  { id: "gpay", label: "GPay / UPI", blurb: "Indian UPI apps", currency: "INR" },
];

function formatPrice(item: PurchaseTarget, method: Method) {
  if (method === "paypal") {
    return item.price_usd ? (item.price_usd.startsWith("$") ? item.price_usd : `$${item.price_usd}`) : item.price || "—";
  }
  return item.price_inr ? (item.price_inr.startsWith("₹") ? item.price_inr : `₹${item.price_inr}`) : "—";
}

function linkFor(item: PurchaseTarget, method: Method) {
  const specific = method === "paypal" ? item.paypal_url : item.gpay_url;
  return specific || item.purchase_url || null;
}

export function PurchaseDialog({
  item,
  ticketFallbackUrl,
  className,
  label = "Buy",
}: {
  item: PurchaseTarget;
  ticketFallbackUrl?: string | null;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<Method | null>(null);
  const [sent, setSent] = useState(false);
  const ticketUrl = item.ticket_url || ticketFallbackUrl || null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setMethod(null);
          setSent(false);
        }
      }}
    >
      <DialogTrigger
        className={cn(
          "clip-notch bg-primary px-4 py-2 font-display text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90",
          className,
        )}
      >
        {label}
      </DialogTrigger>
      <DialogContent className="surface-steel max-w-md border-border">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-[0.14em]">
            {item.title}
          </DialogTitle>
          <DialogDescription>
            Choose a payment method — prices are shown in both currencies.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {METHODS.map((m) => {
            const active = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={cn(
                  "clip-notch flex items-center justify-between border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/20 hover:border-primary/60",
                )}
              >
                <span>
                  <span className="block font-display text-sm uppercase tracking-[0.14em]">
                    {m.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">{m.blurb}</span>
                </span>
                <span className="font-display text-lg text-chrome">
                  {formatPrice(item, m.id)}
                </span>
              </button>
            );
          })}
        </div>

        {method && (
          <div className="mt-2 space-y-4">
            {linkFor(item, method) ? (
              <a
                href={linkFor(item, method)!}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => setSent(true)}
                className="clip-notch flex items-center justify-center gap-2 bg-primary px-5 py-3 font-display text-xs uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Pay with {method === "paypal" ? "PayPal" : "GPay"}
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">
                No {method === "paypal" ? "PayPal" : "GPay"} link set for this item yet — open a
                ticket in the Discord and staff will help you pay.
              </p>
            )}

            <div className="border-t border-border/70 pt-4 text-sm text-muted-foreground">
              <p className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                After paying, take a <strong className="text-foreground">screenshot of the
                payment proof</strong> and open a ticket in the GRBW Discord to claim it.
              </p>
              {ticketUrl && (
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="clip-notch mt-4 inline-flex items-center gap-2 border border-primary/60 bg-primary/10 px-4 py-2 font-display text-[11px] uppercase tracking-[0.2em] text-primary"
                >
                  <Ticket className="h-4 w-4" />
                  Create claim ticket
                </a>
              )}
              {sent && (
                <p className="mt-3 text-xs text-primary">
                  Payment page opened — don't forget the proof screenshot.
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
