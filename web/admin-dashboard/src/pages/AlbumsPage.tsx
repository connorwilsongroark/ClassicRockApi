import { useEffect, useState } from "react";
import { getAlbums, type AlbumListItem } from "@/api/albumsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<AlbumListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    getAlbums()
      .then(setAlbums)
      .catch((err) => {
        console.error(err);
        setError("Could not load albums.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredAlbums = albums.filter((album) =>
    album.title.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title='Albums'
        description='Create, edit, and manage album records.'
        actions={<Button>New Album</Button>}
      />

      <div className='mb-4 max-w-sm'>
        <Input
          placeholder='Search albums...'
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className='rounded-md border bg-background'>
        {isLoading && <div className='p-6 text-sm'>Loading albums...</div>}

        {error && <div className='p-6 text-sm text-destructive'>{error}</div>}

        {!isLoading && !error && (
          <div className='p-6'>
            {filteredAlbums.length === 0 ? (
              <p className='text-sm text-muted-foreground'>No albums found.</p>
            ) : (
              <div className='space-y-3'>
                {filteredAlbums.map((album) => (
                  <div
                    key={album.id}
                    className='flex items-center justify-between rounded-md border p-4'
                  >
                    <div>
                      <div className='font-medium'>{album.title}</div>
                      <div className='text-sm text-muted-foreground'>
                        {album.releaseYear}
                        {/* {album.curatedScore !== null &&
                          ` · Score: ${album.curatedScore}`} */}
                      </div>
                    </div>

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
