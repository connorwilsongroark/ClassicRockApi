import { useEffect, useState } from "react";
import { getArtists, type ArtistListItem } from "@/api/artistsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<ArtistListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    getArtists()
      .then(setArtists)
      .catch((err) => {
        console.error(err);
        setError("Could not load artists.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title='Artists'
        description='Create, edit, and manage artist records.'
        actions={<Button>New Artist</Button>}
      />

      <div className='mb-4 max-w-sm'>
        <Input
          placeholder='Search artists...'
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className='rounded-md border bg-background'>
        {isLoading && <div className='p-6 text-sm'>Loading artists...</div>}

        {error && <div className='p-6 text-sm text-destructive'>{error}</div>}

        {!isLoading && !error && (
          <div className='p-6'>
            {filteredArtists.length === 0 ? (
              <p className='text-sm text-muted-foreground'>No artists found.</p>
            ) : (
              <div className='space-y-3'>
                {filteredArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className='flex items-center justify-between rounded-md border p-4'
                  >
                    <div>
                      <div className='font-medium'>{artist.name}</div>
                      <div className='text-sm text-muted-foreground'>
                        {artist.country ?? "Unknown country"}
                        {artist.formedYear !== null &&
                          ` · Formed ${artist.formedYear}`}
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
