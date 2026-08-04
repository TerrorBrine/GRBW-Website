import { createFileRoute, Link, useHydrated } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Swords, Trophy, Users } from "lucide-react";
import { Mark } from "@/components/mark";
import { AddDialog } from "@/components/add-dialog";
import { DeleteButton } from "@/components/delete-button";
import { useAdmin } from "@/hooks/use-admin";
import { videosQuery } from "@/lib/queries";
import { createVideo, deleteVideo } from "@/lib/admin.functions";
import { parseYoutubeId } from "@/lib/youtube";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GRBW — Ranked Bedwars Community" },
      {
        name: "description",
        content:
          "Join GRBW, a competitive Ranked Bedwars community with ranked queues, member perks and an exclusive store.",
      },
      { property: "og:title", content: "GRBW — Ranked Bedwars Community" },
      {
        property: "og:description",
        content: "Ranked queues, perks and exclusive drops.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(videosQuery),
  errorComponent: ({ error }) => (
    <p role="alert" className="p-10 text-center text-sm text-muted-foreground">
      {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-10 text-center">Nothing here.</p>,
  component: Home,
});

const stats = [
  { icon: Users, label: "Community", value: "Ranked players" },
  { icon: Swords, label: "Format", value: "4v4 · 3v3 Duels" },
  { icon: Trophy, label: "Ranking", value: "ELO based" },
];

function Home() {
  const admin = useAdmin();
  const hydrated = useHydrated();
  const queryClient = useQueryClient();
  const { data: videos } = useSuspenseQuery(videosQuery);
  const addVideo = useServerFn(createVideo);
  const removeVideo = useServerFn(deleteVideo);
  const showAdmin = admin && hydrated;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/70 bg-[image:var(--gradient-hero)]">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-25" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center">
          <Mark className="h-28 w-auto sm:h-40" />
          <h1 className="mt-8 text-5xl font-bold uppercase tracking-[0.12em] text-chrome sm:text-7xl">
            GRBW
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            A competitive Ranked Bedwars community. Queue with real teams, climb a real ELO ladder,
            and earn perks that actually mean something.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/unban"
              className="clip-notch inline-flex items-center gap-2 bg-primary px-6 py-3 font-display text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-[var(--shadow-glow)] transition-opacity hover:opacity-90"
            >
              Unban request <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/links"
              className="clip-notch inline-flex items-center gap-2 border border-border px-6 py-3 font-display text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              Join the community
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto grid max-w-6xl gap-px bg-border/60 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-4 bg-background px-6 py-7">
              <stat.icon className="h-6 w-6 text-primary" />
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="font-display text-sm uppercase tracking-[0.12em]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-[11px] uppercase tracking-[0.4em] text-primary">
              Featured
            </p>
            <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight">Community clips</h2>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {videos.length === 0 && !showAdmin && (
            <p className="text-sm text-muted-foreground">No videos have been posted yet.</p>
          )}

          {videos.map((video) => (
            <article key={video.id} className="surface-steel clip-notch overflow-hidden">
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}`}
                  title={video.title || "GRBW video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="h-full w-full border-0"
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <h3 className="font-display text-sm uppercase tracking-[0.14em]">
                  {video.title || "Untitled clip"}
                </h3>
                {showAdmin && (
                  <DeleteButton
                    onDelete={async () => {
                      await removeVideo({ data: { id: video.id } });
                      await queryClient.invalidateQueries({ queryKey: videosQuery.queryKey });
                    }}
                  />
                )}
              </div>
            </article>
          ))}

          {showAdmin && (
            <AddDialog
              title="Add YouTube video"
              hint="Paste any YouTube link — watch, share or shorts."
              fields={[
                { name: "url", label: "YouTube link", required: true, placeholder: "https://…" },
                { name: "title", label: "Title", placeholder: "Highlight of the week" },
              ]}
              onSubmit={async (values) => {
                const youtubeId = parseYoutubeId(values['url'] ?? "");
                if (!youtubeId) throw new Error("That doesn't look like a YouTube link");
                await addVideo({ data: { youtube_id: youtubeId, title: values['title'] ?? "" } });
                await queryClient.invalidateQueries({ queryKey: videosQuery.queryKey });
              }}
            />
          )}
        </div>
      </section>
    </>
  );
}
