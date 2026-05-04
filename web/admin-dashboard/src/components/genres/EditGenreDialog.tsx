import { useEffect, useState } from "react";
import type { GenreListItem } from "@/api/genresApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGenreMutations } from "@/hooks/useGenreMutations";

type EditGenreDialogProps = {
  genre: GenreListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditGenreDialog({
  genre,
  open,
  onOpenChange,
}: EditGenreDialogProps) {
  const { updateGenreMutation } = useGenreMutations();

  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!genre) return;

    setName(genre.name);
    setFormError(null);
  }, [genre]);

  function handleUpdateGenre() {
    setFormError(null);

    if (!genre) return;

    if (!name.trim()) {
      setFormError("Genre name is required.");
      return;
    }

    updateGenreMutation.mutate(
      {
        id: genre.id,
        body: {
          name: name.trim(),
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Genre</DialogTitle>
          <DialogDescription>Update this genre record.</DialogDescription>
        </DialogHeader>

        <div className='space-y-2'>
          <Label htmlFor='edit-genre-name'>Name</Label>
          <Input
            id='edit-genre-name'
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFormError(null);
            }}
          />
        </div>

        {formError && <p className='text-sm text-destructive'>{formError}</p>}

        {updateGenreMutation.isError && (
          <p className='text-sm text-destructive'>Could not update genre.</p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleUpdateGenre}
            disabled={updateGenreMutation.isPending || !name.trim()}
          >
            {updateGenreMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
