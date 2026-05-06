import { useState } from "react";
import type { AlbumDetail } from "@/api/albumsApi";
import { Button } from "@/components/ui/button";
import { EditAlbumDialog } from "@/components/albums/EditAlbumDialog";

type AlbumBasicInfoCardProps = {
  album: AlbumDetail;
};

export function AlbumBasicInfoCard({ album }: AlbumBasicInfoCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className='rounded-md border bg-background p-6'>
      <div className='mb-4 flex items-center justify-between gap-4'>
        <h2 className='text-lg font-semibold'>Basic Info</h2>

        <Button variant='outline' size='sm' onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>

      <dl className='grid gap-4 sm:grid-cols-3'>
        <div>
          <dt className='text-sm text-muted-foreground'>Title</dt>
          <dd className='font-medium'>{album.title}</dd>
        </div>

        <div>
          <dt className='text-sm text-muted-foreground'>Release Year</dt>
          <dd className='font-medium'>{album.releaseYear}</dd>
        </div>

        <div>
          <dt className='text-sm text-muted-foreground'>Curated Score</dt>
          <dd className='font-medium'>{album.curatedScore ?? "Not scored"}</dd>
        </div>
      </dl>

      <EditAlbumDialog album={album} open={open} onOpenChange={setOpen} />
    </section>
  );
}
