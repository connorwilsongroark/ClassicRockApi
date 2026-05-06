import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AlbumGenre } from "@/api/albumsApi";
import { getGenres } from "@/api/genresApi";
import { Button } from "@/components/ui/button";
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
import { useAlbumGenreMutations } from "@/hooks/useAlbumGenreMutations";

type AddAlbumGenreDialogProps = {
  albumId: string;
  currentGenres: AlbumGenre[];
};

export function AddAlbumGenreDialog({
  albumId,
  currentGenres,
}: AddAlbumGenreDialogProps) {
  const { addGenreMutation } = useAlbumGenreMutations(albumId);

  const [open, setOpen] = useState(false);
  const [selectedGenreId, setSelectedGenreId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: allGenres = [], isLoading } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });

  const availableGenres = useMemo(() => {
    const currentGenreIds = new Set(
      currentGenres.map((genre) => genre.genreId),
    );

    return allGenres.filter((genre) => !currentGenreIds.has(genre.id));
  }, [allGenres, currentGenres]);

  function resetForm() {
    setSelectedGenreId("");
    setFormError(null);
  }

  function handleAddGenre() {
    setFormError(null);

    if (!selectedGenreId) {
      setFormError("Please select a genre.");
      return;
    }

    addGenreMutation.mutate(
      {
        genreId: selectedGenreId,
        isPrimary: currentGenres.length === 0,
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
        <Button size='sm'>Add Genre</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Genre</DialogTitle>
          <DialogDescription>
            Associate an existing genre with this album.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-2'>
          <Label>Genre</Label>

          <Select
            value={selectedGenreId}
            onValueChange={(value) => {
              setSelectedGenreId(value);
              setFormError(null);
            }}
            disabled={isLoading || availableGenres.length === 0}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoading
                    ? "Loading genres..."
                    : availableGenres.length === 0
                      ? "No available genres"
                      : "Select a genre"
                }
              />
            </SelectTrigger>

            <SelectContent>
              {availableGenres.map((genre) => (
                <SelectItem key={genre.id} value={genre.id}>
                  {genre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentGenres.length === 0 && (
          <p className='text-sm text-muted-foreground'>
            Since this album has no genres yet, the selected genre will be
            marked as primary.
          </p>
        )}

        {formError && <p className='text-sm text-destructive'>{formError}</p>}

        {addGenreMutation.isError && (
          <p className='text-sm text-destructive'>
            Could not add genre to album.
          </p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleAddGenre}
            disabled={
              addGenreMutation.isPending ||
              isLoading ||
              availableGenres.length === 0
            }
          >
            {addGenreMutation.isPending ? "Adding..." : "Add Genre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
