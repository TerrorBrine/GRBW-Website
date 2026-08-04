import { createFileRoute, useHydrated } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeading } from "@/components/site-chrome";
import { DeleteButton } from "@/components/delete-button";
import { useAdmin } from "@/hooks/use-admin";
import {
  deleteUnbanRequest,
  listUnbanRequests,
  reviewUnbanRequest,
  submitUnbanRequest,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/unban")({
  head: () => ({
    meta: [
      { title: "Unban Request — GRBW Ranked Bedwars" },
      {
        name: "description",
        content:
          "Banned from GRBW Ranked Bedwars? Submit an unban appeal and the GRBW staff team will review, approve or deny it.",
      },
      { property: "og:title", content: "Unban Request — GRBW Ranked Bedwars" },
      {
        property: "og:description",
        content: "Write your appeal and GRBW admins will review it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => (
    <p role="alert" className="p-10 text-center text-sm text-muted-foreground">
      {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-10 text-center">Nothing here.</p>,
  component: Unban,
});

const statusStyles: Record<string, string> = {
  pending: "border-border text-muted-foreground",
  approved: "border-primary/60 text-primary",
  denied: "border-destructive/60 text-destructive",
};

function Unban() {
  const admin = useAdmin();
  const hydrated = useHydrated();
  const showAdmin = admin && hydrated;

  return (
    <>
      <PageHeading
        eyebrow="Appeals"
        title="Unban Request"
        description="Banned from GRBW? Write your appeal below. Staff review every request and either approve or deny it."
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2">
        <AppealForm />
        {showAdmin ? <ReviewQueue /> : <Guidelines />}
      </section>
    </>
  );
}

function Guidelines() {
  return (
    <div className="surface-steel clip-notch h-fit p-6">
      <h2 className="flex items-center gap-2 font-display text-sm uppercase tracking-[0.2em]">
        <ShieldAlert className="h-4 w-4 text-primary" /> What staff look for
      </h2>
      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
        <li>Use the exact in-game name and Discord tag tied to the ban.</li>
        <li>Be honest about what happened — admitting it helps far more than denying it.</li>
        <li>Explain what changes so it does not happen again.</li>
        <li>One appeal at a time. Spamming appeals gets them denied.</li>
        <li>You will get the decision through your Discord DMs or a staff ticket.</li>
      </ul>
    </div>
  );
}

function AppealForm() {
  const submit = useServerFn(submitUnbanRequest);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await submit({
        data: {
          ign: String(form.get("ign") ?? "").trim(),
          discord_tag: String(form.get("discord_tag") ?? "").trim(),
          ban_reason: String(form.get("ban_reason") ?? "").trim(),
          appeal: String(form.get("appeal") ?? "").trim(),
        },
      });
      setSent(true);
      toast.success("Appeal submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit appeal");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="surface-steel clip-notch h-fit p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 font-display text-lg uppercase tracking-[0.15em]">Appeal received</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Staff will review it and reply with an approval or denial. Do not submit another one.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 font-display text-[11px] uppercase tracking-[0.2em] text-primary hover:underline"
        >
          Submit another appeal
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface-steel clip-notch h-fit p-6">
      <h2 className="font-display text-sm uppercase tracking-[0.2em]">Your appeal</h2>
      <div className="mt-5 space-y-4">
        <Field name="ign" label="Minecraft IGN" required maxLength={40} />
        <Field name="discord_tag" label="Discord tag" required maxLength={60} />
        <Field name="ban_reason" label="Reason you were banned (if known)" maxLength={300} />
        <label className="block">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Appeal
          </span>
          <textarea
            name="appeal"
            required
            minLength={20}
            maxLength={2000}
            rows={7}
            placeholder="Explain what happened and why you should be unbanned."
            className="mt-1.5 w-full resize-y border border-input bg-background/60 px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="clip-notch mt-6 inline-flex w-full items-center justify-center gap-2 bg-primary px-5 py-3 font-display text-sm uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit appeal
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  required,
  maxLength,
}: {
  name: string;
  label: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <input
        name={name}
        required={required}
        maxLength={maxLength}
        className="mt-1.5 w-full border border-input bg-background/60 px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}

function ReviewQueue() {
  const queryClient = useQueryClient();
  const fetchList = useServerFn(listUnbanRequests);
  const review = useServerFn(reviewUnbanRequest);
  const remove = useServerFn(deleteUnbanRequest);
  const { data: requests, isLoading } = useQuery({
    queryKey: ["unban_requests"],
    queryFn: () => fetchList(),
  });

  async function decide(id: string, status: "approved" | "denied", note: string) {
    try {
      await review({ data: { id, status, admin_note: note } });
      await queryClient.invalidateQueries({ queryKey: ["unban_requests"] });
      toast.success(status === "approved" ? "Approved" : "Denied");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update");
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
        Admin review queue
      </h2>
      {isLoading && <p className="text-sm text-muted-foreground">Loading appeals…</p>}
      {requests?.length === 0 && (
        <p className="text-sm text-muted-foreground">No appeals submitted yet.</p>
      )}
      {requests?.map((request) => (
        <ReviewCard
          key={request.id}
          request={request}
          onDecide={decide}
          onDelete={async () => {
            await remove({ data: { id: request.id } });
            await queryClient.invalidateQueries({ queryKey: ["unban_requests"] });
          }}
        />
      ))}
    </div>
  );
}

type RequestRow = {
  id: string;
  ign: string;
  discord_tag: string;
  ban_reason: string;
  appeal: string;
  status: string;
  admin_note: string | null;
  created_at: string;
};

function ReviewCard({
  request,
  onDecide,
  onDelete,
}: {
  request: RequestRow;
  onDecide: (id: string, status: "approved" | "denied", note: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [note, setNote] = useState(request.admin_note ?? "");

  return (
    <article className="surface-steel clip-notch p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base uppercase tracking-[0.12em]">{request.ign}</h3>
          <p className="text-xs text-muted-foreground">
            {request.discord_tag} · {new Date(request.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`border px-2 py-1 font-display text-[10px] uppercase tracking-[0.2em] ${
              statusStyles[request.status] ?? statusStyles["pending"]
            }`}
          >
            {request.status}
          </span>
          <DeleteButton onDelete={onDelete} />
        </div>
      </div>

      {request.ban_reason && (
        <p className="mt-3 text-xs text-muted-foreground">Ban reason: {request.ban_reason}</p>
      )}
      <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/90">{request.appeal}</p>

      <input
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={500}
        placeholder="Note for the decision (optional)"
        className="mt-4 w-full border border-input bg-background/60 px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
      />
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={() => onDecide(request.id, "approved", note)}
          className="clip-notch inline-flex flex-1 items-center justify-center gap-2 bg-primary px-4 py-2 font-display text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          <CheckCircle2 className="h-4 w-4" /> Approve
        </button>
        <button
          type="button"
          onClick={() => onDecide(request.id, "denied", note)}
          className="clip-notch inline-flex flex-1 items-center justify-center gap-2 border border-destructive/60 px-4 py-2 font-display text-[11px] uppercase tracking-[0.2em] text-destructive transition-colors hover:bg-destructive/10"
        >
          <XCircle className="h-4 w-4" /> Deny
        </button>
      </div>
    </article>
  );
}
