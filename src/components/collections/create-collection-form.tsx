import { createCollectionAction } from "@/server/actions/collection.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateCollectionForm() {
  return (
    <form
      action={createCollectionAction}
      className="grid gap-3 rounded-2xl border border-border/80 bg-card/60 p-5 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end"
    >
      <label className="grid gap-2 text-sm font-medium">
        Collection name
        <Input
          name="name"
          placeholder="e.g. Essential albums"
          maxLength={80}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Description{" "}
        <span className="font-normal text-muted-foreground">(optional)</span>
        <Input
          name="description"
          placeholder="What belongs in this collection?"
          maxLength={500}
        />
      </label>
      <Button type="submit" className="h-12">
        Create collection
      </Button>
    </form>
  );
}
