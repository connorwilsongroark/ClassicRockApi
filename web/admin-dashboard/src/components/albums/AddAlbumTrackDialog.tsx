import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AlbumTrack } from "@/api/albumsApi";
import { getTracks } from "@/api/tracksApi";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlbumTrackMutations } from "@/hooks/useAlbumTrackMutations";

type AddAlbumTrackDialogProps = {
  albumId: string;
  currentTracks: AlbumTrack[];
};

export function AddAlbumTrackDialog({
  albumId,
  currentTracks,
}: AddAlbumTrackDialogProps) {
  const { addTrackMutation } = useAlbumTrackMutations(albumId);

  const [open, setOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [trackNumber, setTrackNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: allTracks = [], isLoading } = useQuery({
    queryKey: ["tracks"],
    queryFn: getTracks,
  });

  const availableTracks = useMemo(() => {
    const currentTrackIds = new Set(
      currentTracks.map((track) => track.trackId),
    );

    return allTracks.filter((track) => !currentTrackIds.has(track.id));
  }, [allTracks, currentTracks]);

  function getNextTrackNumber() {
    if (currentTracks.length === 0) return 1;

    return Math.max(...currentTracks.map((track) => track.trackNumber)) + 1;
  }

  function resetForm() {
    setSelectedTrackId("");
    setTrackNumber(String(getNextTrackNumber()));
    setFormError(null);
  }

  function handleAddTrack() {
    setFormError(null);

    if (!selectedTrackId) {
      setFormError("Please select a track.");
      return;
    }

    const parsedTrackNumber = Number(trackNumber);

    if (!trackNumber || Number.isNaN(parsedTrackNumber)) {
      setFormError("Track number must be a valid number.");
      return;
    }

    if (parsedTrackNumber <= 0) {
      setFormError("Track number must be greater than zero.");
      return;
    }

    addTrackMutation.mutate(
      {
        trackId: selectedTrackId,
        trackNumber: parsedTrackNumber,
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

        if (nextOpen) {
          setTrackNumber(String(getNextTrackNumber()));
          setFormError(null);
        } else {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size='sm'>Add Track</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Track</DialogTitle>
          <DialogDescription>
            Associate an existing track with this album.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Track</Label>

            <Select
              value={selectedTrackId}
              onValueChange={(value) => {
                setSelectedTrackId(value);
                setFormError(null);
              }}
              disabled={isLoading || availableTracks.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoading
                      ? "Loading tracks..."
                      : availableTracks.length === 0
                        ? "No available tracks"
                        : "Select a track"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {availableTracks.map((track) => (
                  <SelectItem key={track.id} value={track.id}>
                    {track.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='track-number'>Track Number</Label>
            <Input
              id='track-number'
              type='number'
              min={1}
              value={trackNumber}
              onChange={(e) => {
                setTrackNumber(e.target.value);
                setFormError(null);
              }}
            />
          </div>
        </div>

        {formError && <p className='text-sm text-destructive'>{formError}</p>}

        {addTrackMutation.isError && (
          <p className='text-sm text-destructive'>
            Could not add track to album.
          </p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleAddTrack}
            disabled={
              addTrackMutation.isPending ||
              isLoading ||
              availableTracks.length === 0
            }
          >
            {addTrackMutation.isPending ? "Adding..." : "Add Track"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
