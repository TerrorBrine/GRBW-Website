import { useState, type FormEvent } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type FieldDef = {
  name: string;
  label: string;
  kind?: "text" | "textarea" | "number";
  placeholder?: string;
  required?: boolean;
};

type Props = {
  title: string;
  hint?: string;
  fields: FieldDef[];
  onSubmit: (values: Record<string, string>) => Promise<void>;
  variant?: "tile" | "inline";
};

export function AddDialog({ title, hint, fields, onSubmit, variant = "tile" }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values: Record<string, string> = {};
    for (const field of fields) values[field.name] = String(form.get(field.name) ?? "").trim();
    setBusy(true);
    try {
      await onSubmit(values);
      toast.success("Saved");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {variant === "tile" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="clip-notch group flex min-h-52 w-full flex-col items-center justify-center gap-3 border border-dashed border-border bg-card/40 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-12 w-12 transition-transform group-hover:scale-110" />
          <span className="font-display text-sm uppercase tracking-[0.2em]">{title}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="clip-notch inline-flex items-center gap-2 border border-primary/50 bg-primary/10 px-4 py-2 font-display text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/20"
        >
          <Plus className="h-4 w-4" />
          {title}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/85 p-4 backdrop-blur-sm sm:items-center">
          <form
            onSubmit={handleSubmit}
            className="surface-steel clip-notch my-8 w-full max-w-lg p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg uppercase tracking-[0.15em]">{title}</h3>
                {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {fields.map((field) => (
                <label key={field.name} className="block">
                  <span className="font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {field.label}
                  </span>
                  {field.kind === "textarea" ? (
                    <textarea
                      name={field.name}
                      required={field.required}
                      placeholder={field.placeholder}
                      rows={3}
                      className="mt-1.5 w-full resize-y border border-input bg-background/60 px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                    />
                  ) : (
                    <input
                      name={field.name}
                      type={field.kind === "number" ? "number" : "text"}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="mt-1.5 w-full border border-input bg-background/60 px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                    />
                  )}
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="clip-notch mt-6 inline-flex w-full items-center justify-center gap-2 bg-primary px-5 py-3 font-display text-sm uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </form>
        </div>
      )}
    </>
  );
}
