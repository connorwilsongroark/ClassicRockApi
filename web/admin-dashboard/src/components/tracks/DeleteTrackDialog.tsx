import type { TrackListItem } from "@/api/tracksApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTrackMutations } from "@/hooks/useTrackMutations";

type DeleteTrackDialogProps = {
  track: TrackListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteTrackDialog({
  track,
  open,
  onOpenChange,
}: DeleteTrackDialogProps) {
  const { deleteTrackMutation } = useTrackMutations();

  function handleDeleteTrack() {
    if (!track) return;

    deleteTrackMutation.mutate(track.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Track</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className='font-medium text-foreground'>{track?.name}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {deleteTrackMutation.isError && (
          <p className='text-sm text-destructive'>Could not delete track.</p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            variant='destructive'
            onClick={handleDeleteTrack}
            disabled={deleteTrackMutation.isPending}
          >
            {deleteTrackMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
