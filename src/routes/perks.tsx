import { createFileRoute, useHydrated } from "@tanstack/react-router";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { AddDialog } from "@/components/add-dialog";
import { DeleteButton } from "@/components/delete-button";
import { PurchaseDialog } from "@/components/purchase-dialog";
import { PageHeading } from "@/components/site-chrome";
import { useAdmin } from "@/hooks/use-admin";
import { linksQuery, perksQuery } from "@/lib/queries";
import { createPerk, deletePerk } from "@/lib/admin.functions";

export const Route = createFileRoute("/perks")({
  head: () => ({
    meta: [
      { title: "Perks — GRBW Ranked Bedwars" },
      {
        name: "description",
        content:
          "Purchasable GRBW perks: priority queues, custom roles, cosmetic flair and other community upgrades.",
      },
      { property: "og:title", content: "Perks — GRBW Ranked Bedwars" },
      {
        property: "og:description",
        content: "Purchasable upgrades and member benefits inside the GRBW community.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(perksQuery),
  errorComponent: ({ error }) => (
    <p role="alert" className="p-10 text-center text-sm text-muted-foreground">
      {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-10 text-center">Nothing here.</p>,
  component: Perks,
});

function Perks() {
  const admin = useAdmin();
  const hydrated = useHydrated();
  const queryClient = useQueryClient();
  const { data: perks } = useSuspenseQuery(perksQuery);
  const { data: links } = useQuery(linksQuery);
  const discordUrl =
    links?.find((link) => link.platform === "discord" || /discord/i.test(link.url))?.url ?? null;
  const addPerk = useServerFn(createPerk);
  const removePerk = useServerFn(deletePerk);
  const showAdmin = admin && hydrated;

  return (
    <>
      <PageHeading
        eyebrow="Membership"
        title="Perks"
        description="Support the community and unlock benefits across every GRBW queue."
      />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {perks.length === 0 && !showAdmin && (
            <p className="text-sm text-muted-foreground">No perks have been published yet.</p>
          )}

          {perks.map((perk) => (
            <article
              key={perk.id}
              className="surface-steel clip-notch flex flex-col p-6 transition-shadow hover:shadow-[var(--shadow-glow)]"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg uppercase tracking-[0.12em]">{perk.title}</h2>
                {showAdmin && (
                  <DeleteButton
                    onDelete={async () => {
                      await removePerk({ data: { id: perk.id } });
                      await queryClient.invalidateQueries({ queryKey: perksQuery.queryKey });
                    }}
                  />
                )}
              </div>
              {perk.badge && (
                <span className="mt-3 self-start border border-primary/60 bg-primary/10 px-2 py-1 font-display text-[10px] uppercase tracking-[0.2em] text-primary">
                  {perk.badge}
                </span>
              )}
              {perk.price && (
                <p className="mt-4 font-display text-3xl text-chrome">{perk.price}</p>
              )}
              {perk.description && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {perk.description}
                </p>
              )}
              {perk.features.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm">
                  {perk.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              <PurchaseDialog
                item={perk}
                ticketFallbackUrl={discordUrl}
                label="Purchase"
                className="mt-6 w-full px-5 py-3 text-xs tracking-[0.22em]"
              />
            </article>
          ))}

          {showAdmin && (
            <AddDialog
              title="Add perk"
              hint="Separate feature bullets with a new line."
              fields={[
                { name: "title", label: "Name", required: true },
                { name: "price", label: "Price label", placeholder: "$5 / month" },
                { name: "price_usd", label: "Price in USD", placeholder: "5" },
                { name: "price_inr", label: "Price in INR", placeholder: "420" },
                { name: "badge", label: "Badge", placeholder: "Most popular" },
                { name: "description", label: "Description", kind: "textarea" },
                { name: "features", label: "Features (one per line)", kind: "textarea" },
                { name: "paypal_url", label: "PayPal payment link" },
                { name: "gpay_url", label: "GPay / UPI payment link" },
                { name: "purchase_url", label: "Fallback purchase link" },
                { name: "ticket_url", label: "Claim ticket link (Discord)" },
              ]}
              onSubmit={async (values) => {
                await addPerk({
                  data: {
                    title: values["title"] ?? "",
                    price: values["price"] ?? "",
                    price_usd: values["price_usd"] || null,
                    price_inr: values["price_inr"] || null,
                    badge: values["badge"] || null,
                    description: values["description"] ?? "",
                    features: (values["features"] ?? "")
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean),
                    paypal_url: values["paypal_url"] || null,
                    gpay_url: values["gpay_url"] || null,
                    purchase_url: values["purchase_url"] || null,
                    ticket_url: values["ticket_url"] || null,
                  },
                });
                await queryClient.invalidateQueries({ queryKey: perksQuery.queryKey });
              }}
            />
          )}
        </div>
      </section>
    </>
  );
}
