import { useEffect, useState } from "react";
import type { AlbumListItem } from "@/api/albumsApi";
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
import { useAlbumMutations } from "@/hooks/useAlbumMutations";

type EditAlbumDialogProps = {
  album: AlbumListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditAlbumDialog({
  album,
  open,
  onOpenChange,
}: EditAlbumDialogProps) {
  const { updateAlbumMutation } = useAlbumMutations();

  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [curatedScore, setCuratedScore] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!album) return;

    setTitle(album.title);
    setReleaseYear(String(album.releaseYear));
    setCuratedScore(
      album.curatedScore === null ? "" : String(album.curatedScore),
    );
    setFormError(null);
  }, [album]);

  function handleUpdateAlbum() {
    setFormError(null);

    if (!album) return;

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

    updateAlbumMutation.mutate(
      {
        id: album.id,
        body: {
          title: title.trim(),
          releaseYear: year,
          curatedScore: score,
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
          <DialogTitle>Edit Album</DialogTitle>
          <DialogDescription>Update this album record.</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='edit-title'>Title</Label>
            <Input
              id='edit-title'
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setFormError(null);
              }}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='edit-release-year'>Release Year</Label>
            <Input
              id='edit-release-year'
              type='number'
              value={releaseYear}
              onChange={(e) => {
                setReleaseYear(e.target.value);
                setFormError(null);
              }}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='edit-curated-score'>Curated Score</Label>
            <Input
              id='edit-curated-score'
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

        {updateAlbumMutation.isError && (
          <p className='text-sm text-destructive'>Could not update album.</p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleUpdateAlbum}
            disabled={
              updateAlbumMutation.isPending || !title.trim() || !releaseYear
            }
          >
            {updateAlbumMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
