import type { AlbumGenre } from "@/api/albumsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddAlbumGenreDialog } from "./AddAlbumGenreDialog";
import { useAlbumGenreMutations } from "@/hooks/useAlbumGenreMutations";
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

type AlbumGenresSectionProps = {
  albumId: string;
  genres: AlbumGenre[];
};

export function AlbumGenresSection({
  albumId,
  genres,
}: AlbumGenresSectionProps) {
  const { updateGenreMutation, removeGenreMutation } =
    useAlbumGenreMutations(albumId);

  function handleSetPrimary(genreId: string) {
    updateGenreMutation.mutate({
      genreId,
      isPrimary: true,
    });
  }

  function handleRemoveGenre(genreId: string) {
    removeGenreMutation.mutate(genreId);
  }

  return (
    <section className='rounded-md border bg-background p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Genres</h2>
        <AddAlbumGenreDialog albumId={albumId} currentGenres={genres} />
      </div>

      {genres.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          No genres associated with this album.
        </p>
      ) : (
        <div className='space-y-3'>
          {genres.map((genre) => (
            <div
              key={genre.genreId}
              className='flex items-center justify-between rounded-md border p-4'
            >
              <div>
                <div className='font-medium'>{genre.genreName}</div>

                <div className='mt-1'>
                  {genre.isPrimary ? (
                    <Badge>Primary</Badge>
                  ) : (
                    <Badge variant='secondary'>Secondary</Badge>
                  )}
                </div>
              </div>

              <div className='flex gap-2'>
                {!genre.isPrimary && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleSetPrimary(genre.genreId)}
                    disabled={updateGenreMutation.isPending}
                  >
                    Set Primary
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant='destructive'
                      size='sm'
                      disabled={removeGenreMutation.isPending}
                    >
                      Remove
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Genre</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove{" "}
                        <span className='font-medium text-foreground'>
                          {genre.genreName}
                        </span>{" "}
                        from this album?
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>

                      <AlertDialogAction
                        onClick={() => handleRemoveGenre(genre.genreId)}
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

      {updateGenreMutation.isError && (
        <p className='mt-4 text-sm text-destructive'>Could not update genre.</p>
      )}

      {removeGenreMutation.isError && (
        <p className='mt-4 text-sm text-destructive'>Could not remove genre.</p>
      )}
    </section>
  );
}
