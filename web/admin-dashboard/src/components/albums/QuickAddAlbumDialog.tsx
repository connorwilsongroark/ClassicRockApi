import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { useAlbumMutations } from "@/hooks/useAlbumMutations";
import { useAuthPermissions } from "@/hooks/useAuthPermissions";
import { DurationInput } from "../common/DurationInput";

type TrackInput = {
  name: string;
  duration: string;
};

const emptyTrack: TrackInput = {
  name: "",
  duration: "00:00:00",
};

export function QuickAddAlbumDialog() {
  const { hasPermission } = useAuthPermissions();

  const canQuickAddAlbum =
    hasPermission("create:albums") &&
    hasPermission("create:tracks") &&
    hasPermission("manage:album-tracks");

  const { quickAddAlbumMutation } = useAlbumMutations();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [curatedScore, setCuratedScore] = useState("");
  const [tracks, setTracks] = useState<TrackInput[]>([{ ...emptyTrack }]);
  const [formError, setFormError] = useState<string | null>(null);

  if (!canQuickAddAlbum) return null;

  function resetForm() {
    setTitle("");
    setReleaseYear("");
    setCuratedScore("");
    setTracks([{ ...emptyTrack }]);
    setFormError(null);
  }

  function updateTrack(index: number, field: keyof TrackInput, value: string) {
    setTracks((current) =>
      current.map((track, i) =>
        i === index ? { ...track, [field]: value } : track,
      ),
    );
    setFormError(null);
  }

  function addTrack() {
    setTracks((current) => [...current, { ...emptyTrack }]);
  }

  function removeTrack(index: number) {
    setTracks((current) => current.filter((_, i) => i !== index));
  }

  function handleQuickAdd() {
    setFormError(null);

    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    const year = Number(releaseYear);

    if (!releaseYear || Number.isNaN(year)) {
      setFormError("Release year must be a valid number.");
      return;
    }

    const score = curatedScore.trim() === "" ? null : Number(curatedScore);

    if (score !== null && Number.isNaN(score)) {
      setFormError("Curated score must be a valid number.");
      return;
    }

    const validTracks = tracks
      .map((track) => ({
        name: track.name.trim(),
        duration: track.duration.trim(),
      }))
      .filter((track) => track.name.length > 0);

    if (validTracks.length === 0) {
      setFormError("At least one track is required.");
      return;
    }

    quickAddAlbumMutation.mutate(
      {
        title: title.trim(),
        releaseYear: year,
        curatedScore: score,
        tracks: validTracks,
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
        <Button variant='outline'>Quick Add</Button>
      </DialogTrigger>

      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Quick Add Album</DialogTitle>
          <DialogDescription>
            Create an album and add its tracks in one step. Track numbers are
            assigned by the order below.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='grid gap-4 sm:grid-cols-3'>
            <div className='space-y-2 sm:col-span-3'>
              <Label htmlFor='quick-add-title'>Title</Label>
              <Input
                id='quick-add-title'
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setFormError(null);
                }}
                placeholder='Wish You Were Here'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='quick-add-release-year'>Release Year</Label>
              <Input
                id='quick-add-release-year'
                type='number'
                value={releaseYear}
                onChange={(e) => {
                  setReleaseYear(e.target.value);
                  setFormError(null);
                }}
                placeholder='1975'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='quick-add-curated-score'>Curated Score</Label>
              <Input
                id='quick-add-curated-score'
                type='number'
                value={curatedScore}
                onChange={(e) => {
                  setCuratedScore(e.target.value);
                  setFormError(null);
                }}
                placeholder='Optional'
              />
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <h3 className='text-sm font-medium'>Tracks</h3>
                <p className='text-sm text-muted-foreground'>
                  Duration should be formatted like 00:03:45.
                </p>
              </div>

              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={addTrack}
              >
                <Plus className='mr-2 h-4 w-4' />
                Add Track
              </Button>
            </div>

            <div className='space-y-3'>
              {tracks.map((track, index) => (
                <div
                  key={index}
                  className='grid gap-3 rounded-md border p-3 sm:grid-cols-[auto_1fr_140px_auto]'
                >
                  <div className='pt-2 text-sm text-muted-foreground'>
                    {index + 1}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor={`track-name-${index}`}>Track Name</Label>
                    <Input
                      id={`track-name-${index}`}
                      value={track.name}
                      onChange={(e) =>
                        updateTrack(index, "name", e.target.value)
                      }
                      placeholder='Shine On You Crazy Diamond'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor={`track-duration-${index}`}>Duration</Label>
                    <DurationInput
                      id={`track-duration-${index}`}
                      value={track.duration}
                      onChange={(value) =>
                        updateTrack(index, "duration", value)
                      }
                      placeholder='00:00:00'
                    />
                  </div>

                  <div className='flex items-end'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      disabled={tracks.length === 1}
                      onClick={() => removeTrack(index)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {formError && <p className='text-sm text-destructive'>{formError}</p>}

        {quickAddAlbumMutation.isError && (
          <p className='text-sm text-destructive'>Could not quick-add album.</p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleQuickAdd}
            disabled={
              quickAddAlbumMutation.isPending || !title.trim() || !releaseYear
            }
          >
            {quickAddAlbumMutation.isPending ? "Creating..." : "Quick Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
