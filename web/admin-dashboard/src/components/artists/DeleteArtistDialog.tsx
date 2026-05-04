import type { ArtistListItem } from "@/api/artistsApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useArtistMutations } from "@/hooks/useArtistMutations";

type DeleteArtistDialogProps = {
  artist: ArtistListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteArtistDialog({
  artist,
  open,
  onOpenChange,
}: DeleteArtistDialogProps) {
  const { deleteArtistMutation } = useArtistMutations();

  function handleDeleteArtist() {
    if (!artist) return;

    deleteArtistMutation.mutate(artist.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Artist</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className='font-medium text-foreground'>{artist?.name}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {deleteArtistMutation.isError && (
          <p className='text-sm text-destructive'>Could not delete artist.</p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            variant='destructive'
            onClick={handleDeleteArtist}
            disabled={deleteArtistMutation.isPending}
          >
            {deleteArtistMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
