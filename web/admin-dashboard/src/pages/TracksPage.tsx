import { useEffect, useState } from "react";
import { getTracks, type TrackListItem } from "@/api/tracksApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";

export default function TracksPage() {
  const [tracks, setTracks] = useState<TrackListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    getTracks()
      .then(setTracks)
      .catch((err) => {
        console.error(err);
        setError("Could not load tracks.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredTracks = tracks.filter((track) =>
    track.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title='Tracks'
        description='Create, edit, and manage track records.'
        actions={<Button>New Track</Button>}
      />

      <div className='mb-4 max-w-sm'>
        <Input
          placeholder='Search tracks...'
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className='rounded-md border bg-background'>
        {isLoading && <div className='p-6 text-sm'>Loading tracks...</div>}

        {error && <div className='p-6 text-sm text-destructive'>{error}</div>}

        {!isLoading && !error && (
          <div className='p-6'>
            {filteredTracks.length === 0 ? (
              <p className='text-sm text-muted-foreground'>No tracks found.</p>
            ) : (
              <div className='space-y-3'>
                {filteredTracks.map((track) => (
                  <div
                    key={track.id}
                    className='flex items-center justify-between rounded-md border p-4'
                  >
                    <div>
                      <div className='font-medium'>{track.name}</div>
                      <div className='text-sm text-muted-foreground'>
                        {track.duration ?? "Unknown duration"}
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
