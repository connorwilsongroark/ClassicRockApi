import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGenres, type GenreListItem } from "@/api/genresApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreateGenreDialog } from "@/components/genres/CreateGenreDialog";
import { EditGenreDialog } from "@/components/genres/EditGenreDialog";
import { DeleteGenreDialog } from "@/components/genres/DeleteGenreDialog";

export default function GenresPage() {
  const [searchText, setSearchText] = useState("");
  const [editingGenre, setEditingGenre] = useState<GenreListItem | null>(null);
  const [genreToDelete, setGenreToDelete] = useState<GenreListItem | null>(
    null,
  );

  const {
    data: genres = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });

  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title='Genres'
        description='Create, edit, and manage genre records.'
        actions={<CreateGenreDialog />}
      />

      <div className='mb-4 max-w-sm'>
        <Input
          placeholder='Search genres...'
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className='rounded-md border bg-background'>
        {isLoading && <div className='p-6 text-sm'>Loading genres...</div>}

        {error && (
          <div className='p-6 text-sm text-destructive'>
            Could not load genres.
          </div>
        )}

        {!isLoading && !error && (
          <div className='p-6'>
            {filteredGenres.length === 0 ? (
              <p className='text-sm text-muted-foreground'>No genres found.</p>
            ) : (
              <div className='space-y-3'>
                {filteredGenres.map((genre) => (
                  <div
                    key={genre.id}
                    className='flex items-center justify-between rounded-md border p-4'
                  >
                    <div className='font-medium'>{genre.name}</div>

                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setEditingGenre(genre)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => setGenreToDelete(genre)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <EditGenreDialog
        genre={editingGenre}
        open={editingGenre !== null}
        onOpenChange={(open) => {
          if (!open) setEditingGenre(null);
        }}
      />

      <DeleteGenreDialog
        genre={genreToDelete}
        open={genreToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setGenreToDelete(null);
        }}
      />
    </div>
  );
}
