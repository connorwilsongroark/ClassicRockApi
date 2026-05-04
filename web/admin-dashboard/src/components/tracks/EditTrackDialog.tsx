import { useEffect, useState } from "react";
import type { TrackListItem } from "@/api/tracksApi";
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
import { useTrackMutations } from "@/hooks/useTrackMutations";

type EditTrackDialogProps = {
  track: TrackListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditTrackDialog({
  track,
  open,
  onOpenChange,
}: EditTrackDialogProps) {
  const { updateTrackMutation } = useTrackMutations();

  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!track) return;

    setName(track.name);
    setDuration(track.duration ?? "");
    setFormError(null);
  }, [track]);

  function handleUpdateTrack() {
    setFormError(null);

    if (!track) return;

    if (!name.trim()) {
      setFormError("Track name is required.");
      return;
    }

    updateTrackMutation.mutate(
      {
        id: track.id,
        body: {
          name: name.trim(),
          duration: duration.trim() === "" ? null : duration.trim(),
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
          <DialogTitle>Edit Track</DialogTitle>
          <DialogDescription>Update this track record.</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='edit-track-name'>Name</Label>
            <Input
              id='edit-track-name'
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError(null);
              }}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='edit-track-duration'>Duration</Label>
            <Input
              id='edit-track-duration'
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                setFormError(null);
              }}
              placeholder='Optional, e.g. 00:03:45'
            />
          </div>
        </div>

        {formError && <p className='text-sm text-destructive'>{formError}</p>}

        {updateTrackMutation.isError && (
          <p className='text-sm text-destructive'>Could not update track.</p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleUpdateTrack}
            disabled={updateTrackMutation.isPending || !name.trim()}
          >
            {updateTrackMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
