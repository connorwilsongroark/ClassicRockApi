import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTrackMutations } from "@/hooks/useTrackMutations";

export function CreateTrackDialog() {
  const { createTrackMutation } = useTrackMutations();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setDuration("");
    setFormError(null);
  }

  function handleCreateTrack() {
    setFormError(null);

    if (!name.trim()) {
      setFormError("Track name is required.");
      return;
    }

    createTrackMutation.mutate(
      {
        name: name.trim(),
        duration: duration.trim() === "" ? null : duration.trim(),
      },
      {
        onSuccess: () => {
          resetForm();
          setOpen(false);
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>New Track</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Track</DialogTitle>
          <DialogDescription>
            Add a new track to your music catalog.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='create-track-name'>Name</Label>
            <Input
              id='create-track-name'
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError(null);
              }}
              placeholder='Shine On You Crazy Diamond'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='create-track-duration'>Duration</Label>
            <Input
              id='create-track-duration'
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                setFormError(null);
              }}
              placeholder='00:13:31'
            />
          </div>
        </div>

        {formError && <p className='text-sm text-destructive'>{formError}</p>}

        {createTrackMutation.isError && (
          <p className='text-sm text-destructive'>Could not create track.</p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleCreateTrack}
            disabled={createTrackMutation.isPending || !name.trim()}
          >
            {createTrackMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
