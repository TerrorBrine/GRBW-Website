import { createFileRoute, useHydrated } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight } from "lucide-react";
import { AddDialog } from "@/components/add-dialog";
import { DeleteButton } from "@/components/delete-button";
import { PageHeading } from "@/components/site-chrome";
import { useAdmin } from "@/hooks/use-admin";
import { linksQuery } from "@/lib/queries";
import { createLink, deleteLink } from "@/lib/admin.functions";

export const Route = createFileRoute("/links")({
  head: () => ({
    meta: [
      { title: "Links — GRBW Ranked Bedwars" },
      {
        name: "description",
        content:
          "Every official GRBW link in one place: Discord, YouTube, TikTok, X and the rest of the community's channels.",
      },
      { property: "og:title", content: "Links — GRBW Ranked Bedwars" },
      {
        property: "og:description",
        content: "All official GRBW community channels and social links.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(linksQuery),
  errorComponent: ({ error }) => (
    <p role="alert" className="p-10 text-center text-sm text-muted-foreground">
      {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-10 text-center">Nothing here.</p>,
  component: Links,
});

function Links() {
  const admin = useAdmin();
  const hydrated = useHydrated();
  const queryClient = useQueryClient();
  const { data: links } = useSuspenseQuery(linksQuery);
  const addLink = useServerFn(createLink);
  const removeLink = useServerFn(deleteLink);
  const showAdmin = admin && hydrated;

  return (
    <>
      <PageHeading
        eyebrow="Connect"
        title="Links"
        description="Official GRBW channels. Everything else claiming to be us isn't."
      />

      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="grid gap-4">
          {links.length === 0 && !showAdmin && (
            <p className="text-sm text-muted-foreground">No links have been added yet.</p>
          )}

          {links.map((link) => (
            <div
              key={link.id}
              className="surface-steel clip-notch flex items-center justify-between gap-4 px-5 py-4"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex flex-1 items-center justify-between gap-4"
              >
                <div>
                  <p className="font-display text-sm uppercase tracking-[0.18em] transition-colors group-hover:text-primary">
                    {link.label}
                  </p>
                  {link.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{link.description}</p>
                  )}
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </a>
              {showAdmin && (
                <DeleteButton
                  onDelete={async () => {
                    await removeLink({ data: { id: link.id } });
                    await queryClient.invalidateQueries({ queryKey: linksQuery.queryKey });
                  }}
                />
              )}
            </div>
          ))}

          {showAdmin && (
            <AddDialog
              variant="inline"
              title="Add link"
              fields={[
                { name: "label", label: "Label", required: true, placeholder: "Discord" },
                { name: "url", label: "URL", required: true, placeholder: "https://discord.gg/…" },
                { name: "description", label: "Description", placeholder: "Main community hub" },
              ]}
              onSubmit={async (values) => {
                await addLink({
                  data: {
                    label: values["label"] ?? "",
                    url: values["url"] ?? "",
                    description: values["description"] ?? "",
                    platform: "link",
                  },
                });
                await queryClient.invalidateQueries({ queryKey: linksQuery.queryKey });
              }}
            />
          )}
        </div>
      </section>
    </>
  );
}
