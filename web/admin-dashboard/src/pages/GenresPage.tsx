import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGenres } from "@/api/genresApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";

export default function GenresPage() {
  const [searchText, setSearchText] = useState("");

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
        actions={<Button>New Genre</Button>}
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

                    <Button variant='outline' size='sm'>
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
