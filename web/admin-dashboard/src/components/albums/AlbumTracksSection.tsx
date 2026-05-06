import type { AlbumTrack } from "@/api/albumsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AlbumTracksSectionProps = {
  tracks: AlbumTrack[];
};

export function AlbumTracksSection({ tracks }: AlbumTracksSectionProps) {
  return (
    <section className='rounded-md border bg-background p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Tracks</h2>
        <Button size='sm'>Add Track</Button>
      </div>

      {tracks.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          No tracks associated with this album.
        </p>
      ) : (
        <div className='space-y-3'>
          {tracks.map((track) => (
            <div
              key={track.trackId}
              className='flex items-center justify-between rounded-md border p-4'
            >
              <div>
                <div className='font-medium'>{track.trackName}</div>

                <div className='mt-1 flex gap-2'>
                  <Badge variant='secondary'>Track {track.trackNumber}</Badge>
                  <Badge variant='outline'>
                    {track.duration ?? "Unknown duration"}
                  </Badge>
                </div>
              </div>

              <div className='flex gap-2'>
                <Button variant='outline' size='sm'>
                  Edit Number
                </Button>

                <Button variant='destructive' size='sm'>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
