import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await onDelete();
          toast.success("Removed");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not remove");
        } finally {
          setBusy(false);
        }
      }}
      aria-label="Remove"
      className="rounded-sm border border-border/70 bg-background/70 p-1.5 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
