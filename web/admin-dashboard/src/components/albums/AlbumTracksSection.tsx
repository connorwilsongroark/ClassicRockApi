import { useState } from "react";
import type { AlbumTrack } from "@/api/albumsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AddAlbumTrackDialog } from "./AddAlbumTrackDialog";
import { useAlbumTrackMutations } from "@/hooks/useAlbumTrackMutations";

type AlbumTracksSectionProps = {
  albumId: string;
  tracks: AlbumTrack[];
};

export function AlbumTracksSection({
  albumId,
  tracks,
}: AlbumTracksSectionProps) {
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [trackNumberInput, setTrackNumberInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { updateTrackMutation, removeTrackMutation } =
    useAlbumTrackMutations(albumId);

  const sortedTracks = [...tracks].sort(
    (a, b) => a.trackNumber - b.trackNumber,
  );

  function openEditNumber(track: AlbumTrack) {
    setEditingTrackId(track.trackId);
    setTrackNumberInput(String(track.trackNumber));
    setFormError(null);
  }

  function handleUpdateTrackNumber(trackId: string) {
    setFormError(null);

    const parsedTrackNumber = Number(trackNumberInput);

    if (!trackNumberInput || Number.isNaN(parsedTrackNumber)) {
      setFormError("Track number must be a valid number.");
      return;
    }

    if (parsedTrackNumber <= 0) {
      setFormError("Track number must be greater than zero.");
      return;
    }

    updateTrackMutation.mutate(
      {
        trackId,
        trackNumber: parsedTrackNumber,
      },
      {
        onSuccess: () => {
          setEditingTrackId(null);
          setTrackNumberInput("");
          setFormError(null);
        },
      },
    );
  }

  function handleRemoveTrack(trackId: string) {
    removeTrackMutation.mutate(trackId);
  }

  return (
    <section className='rounded-md border bg-background p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Tracks</h2>
        <AddAlbumTrackDialog albumId={albumId} currentTracks={tracks} />
      </div>

      {tracks.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          No tracks associated with this album.
        </p>
      ) : (
        <div className='space-y-3'>
          {sortedTracks.map((track) => (
            <div
              key={track.trackId}
              className='flex items-center justify-between rounded-md border p-4'
            >
              <div>
                <div className='font-medium'>{track.trackName}</div>

                <div className='mt-1 flex gap-2'>
                  <Badge variant='secondary'>Track {track.trackNumber}</Badge>
                  <Badge variant='outline'>
                    {track.duration ?? "Unknown duration"}
                  </Badge>
                </div>
              </div>

              <div className='flex gap-2'>
                <Popover
                  open={editingTrackId === track.trackId}
                  onOpenChange={(open) => {
                    if (open) {
                      openEditNumber(track);
                    } else {
                      setEditingTrackId(null);
                      setFormError(null);
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={updateTrackMutation.isPending}
                    >
                      Edit Number
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className='w-56' align='end'>
                    <div className='space-y-3'>
                      <div>
                        <p className='text-sm font-medium'>Track Number</p>
                        <p className='text-xs text-muted-foreground'>
                          Update this track&apos;s position on the album.
                        </p>
                      </div>

                      <Input
                        type='number'
                        min={1}
                        value={trackNumberInput}
                        onChange={(e) => {
                          setTrackNumberInput(e.target.value);
                          setFormError(null);
                        }}
                      />

                      {formError && (
                        <p className='text-sm text-destructive'>{formError}</p>
                      )}

                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setEditingTrackId(null);
                            setFormError(null);
                          }}
                        >
                          Cancel
                        </Button>

                        <Button
                          size='sm'
                          onClick={() => handleUpdateTrackNumber(track.trackId)}
                          disabled={
                            updateTrackMutation.isPending || !trackNumberInput
                          }
                        >
                          {updateTrackMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant='destructive'
                      size='sm'
                      disabled={removeTrackMutation.isPending}
                    >
                      Remove
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Track</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove{" "}
                        <span className='font-medium text-foreground'>
                          {track.trackName}
                        </span>{" "}
                        from this album?
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>

                      <AlertDialogAction
                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        onClick={() => handleRemoveTrack(track.trackId)}
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {updateTrackMutation.isError && (
        <p className='mt-4 text-sm text-destructive'>
          Could not update track number.
        </p>
      )}

      {removeTrackMutation.isError && (
        <p className='mt-4 text-sm text-destructive'>Could not remove track.</p>
      )}
    </section>
  );
}
