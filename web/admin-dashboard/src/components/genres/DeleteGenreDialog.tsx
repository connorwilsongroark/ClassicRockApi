import type { GenreListItem } from "@/api/genresApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGenreMutations } from "@/hooks/useGenreMutations";

type DeleteGenreDialogProps = {
  genre: GenreListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteGenreDialog({
  genre,
  open,
  onOpenChange,
}: DeleteGenreDialogProps) {
  const { deleteGenreMutation } = useGenreMutations();

  function handleDeleteGenre() {
    if (!genre) return;

    deleteGenreMutation.mutate(genre.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Genre</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className='font-medium text-foreground'>{genre?.name}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {deleteGenreMutation.isError && (
          <p className='text-sm text-destructive'>Could not delete genre.</p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            variant='destructive'
            onClick={handleDeleteGenre}
            disabled={deleteGenreMutation.isPending}
          >
            {deleteGenreMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
