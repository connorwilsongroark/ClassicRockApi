import type { AlbumListItem } from "@/api/albumsApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAlbumMutations } from "@/hooks/useAlbumMutations";

type DeleteAlbumDialogProps = {
  album: AlbumListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteAlbumDialog({
  album,
  open,
  onOpenChange,
}: DeleteAlbumDialogProps) {
  const { deleteAlbumMutation } = useAlbumMutations();

  function handleDeleteAlbum() {
    if (!album) return;

    deleteAlbumMutation.mutate(album.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Album</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className='font-medium text-foreground'>{album?.title}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {deleteAlbumMutation.isError && (
          <p className='text-sm text-destructive'>Could not delete album.</p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            variant='destructive'
            onClick={handleDeleteAlbum}
            disabled={deleteAlbumMutation.isPending}
          >
            {deleteAlbumMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
