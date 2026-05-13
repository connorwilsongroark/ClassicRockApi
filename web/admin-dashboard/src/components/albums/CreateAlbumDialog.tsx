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
import { useAlbumMutations } from "@/hooks/useAlbumMutations";
import { useAuthPermissions } from "@/hooks/useAuthPermissions";

export function CreateAlbumDialog() {
  const { createAlbumMutation } = useAlbumMutations();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [curatedScore, setCuratedScore] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { hasPermission } = useAuthPermissions();
  const canCreateAlbums = hasPermission("create:albums");

  function resetForm() {
    setTitle("");
    setReleaseYear("");
    setCuratedScore("");
    setFormError(null);
  }

  function handleCreateAlbum() {
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

    createAlbumMutation.mutate(
      {
        title: title.trim(),
        releaseYear: year,
        curatedScore: score,
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
        <Button disabled={!canCreateAlbums}>New Album</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Album</DialogTitle>
          <DialogDescription>
            Add a new album record to your music catalog.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='create-title'>Title</Label>
            <Input
              id='create-title'
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setFormError(null);
              }}
              placeholder='Wish You Were Here'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='create-release-year'>Release Year</Label>
            <Input
              id='create-release-year'
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
            <Label htmlFor='create-curated-score'>Curated Score</Label>
            <Input
              id='create-curated-score'
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

        {formError && <p className='text-sm text-destructive'>{formError}</p>}

        {createAlbumMutation.isError && (
          <p className='text-sm text-destructive'>Could not create album.</p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleCreateAlbum}
            disabled={
              createAlbumMutation.isPending || !title.trim() || !releaseYear
            }
          >
            {createAlbumMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
