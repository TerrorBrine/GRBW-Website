import { createFileRoute, useHydrated } from "@tanstack/react-router";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AddDialog } from "@/components/add-dialog";
import { DeleteButton } from "@/components/delete-button";
import { PurchaseDialog } from "@/components/purchase-dialog";
import { PageHeading } from "@/components/site-chrome";
import { useAdmin } from "@/hooks/use-admin";
import { linksQuery, storeQuery } from "@/lib/queries";
import { createStoreItem, deleteStoreItem } from "@/lib/admin.functions";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Store — GRBW Ranked Bedwars" },
      {
        name: "description",
        content:
          "The GRBW store: exclusive items, limited drops and community gear available to ranked members.",
      },
      { property: "og:title", content: "Store — GRBW Ranked Bedwars" },
      {
        property: "og:description",
        content: "Exclusive purchasable items and limited drops from the GRBW community.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(storeQuery),
  errorComponent: ({ error }) => (
    <p role="alert" className="p-10 text-center text-sm text-muted-foreground">
      {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-10 text-center">Nothing here.</p>,
  component: Store,
});

function Store() {
  const admin = useAdmin();
  const hydrated = useHydrated();
  const queryClient = useQueryClient();
  const { data: items } = useSuspenseQuery(storeQuery);
  const { data: links } = useQuery(linksQuery);
  const discordUrl =
    links?.find((link) => link.platform === "discord" || /discord/i.test(link.url))?.url ?? null;
  const addItem = useServerFn(createStoreItem);
  const removeItem = useServerFn(deleteStoreItem);
  const showAdmin = admin && hydrated;

  return (
    <>
      <PageHeading
        eyebrow="Exclusive"
        title="Store"
        description="Limited items released for GRBW members. New drops appear here first."
      />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 && !showAdmin && (
            <p className="text-sm text-muted-foreground">The store is empty right now.</p>
          )}

          {items.map((item) => (
            <article key={item.id} className="surface-steel clip-notch flex flex-col overflow-hidden">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="grid-lines aspect-[4/3] w-full bg-muted/30" />
              )}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-base uppercase tracking-[0.12em]">
                    {item.title}
                  </h2>
                  {showAdmin && (
                    <DeleteButton
                      onDelete={async () => {
                        await removeItem({ data: { id: item.id } });
                        await queryClient.invalidateQueries({ queryKey: storeQuery.queryKey });
                      }}
                    />
                  )}
                </div>
                {item.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                  <div>
                    {item.price && (
                      <p className="font-display text-xl text-chrome">{item.price}</p>
                    )}
                    {item.stock_label && (
                      <p className="font-display text-[10px] uppercase tracking-[0.22em] text-primary">
                        {item.stock_label}
                      </p>
                    )}
                  </div>
                  <PurchaseDialog item={item} ticketFallbackUrl={discordUrl} label="Buy" />
                </div>
              </div>
            </article>
          ))}

          {showAdmin && (
            <AddDialog
              title="Add store item"
              fields={[
                { name: "title", label: "Item name", required: true },
                { name: "price", label: "Price label", placeholder: "$12" },
                { name: "price_usd", label: "Price in USD", placeholder: "12" },
                { name: "price_inr", label: "Price in INR", placeholder: "999" },
                { name: "stock_label", label: "Stock label", placeholder: "Only 10 left" },
                { name: "description", label: "Description", kind: "textarea" },
                { name: "image_url", label: "Image URL" },
                { name: "paypal_url", label: "PayPal payment link" },
                { name: "gpay_url", label: "GPay / UPI payment link" },
                { name: "purchase_url", label: "Fallback purchase link" },
                { name: "ticket_url", label: "Claim ticket link (Discord)" },
              ]}
              onSubmit={async (values) => {
                await addItem({
                  data: {
                    title: values["title"] ?? "",
                    price: values["price"] ?? "",
                    price_usd: values["price_usd"] || null,
                    price_inr: values["price_inr"] || null,
                    stock_label: values["stock_label"] || null,
                    description: values["description"] ?? "",
                    image_url: values["image_url"] || null,
                    paypal_url: values["paypal_url"] || null,
                    gpay_url: values["gpay_url"] || null,
                    purchase_url: values["purchase_url"] || null,
                    ticket_url: values["ticket_url"] || null,
                  },
                });
                await queryClient.invalidateQueries({ queryKey: storeQuery.queryKey });
              }}
            />
          )}
        </div>
      </section>
    </>
  );
}
