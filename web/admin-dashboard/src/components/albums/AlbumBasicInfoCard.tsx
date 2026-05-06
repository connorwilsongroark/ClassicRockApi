import type { AlbumDetail } from "@/api/albumsApi";

type AlbumBasicInfoCardProps = {
  album: AlbumDetail;
};

export function AlbumBasicInfoCard({ album }: AlbumBasicInfoCardProps) {
  return (
    <section className='rounded-md border bg-background p-6'>
      <h2 className='mb-4 text-lg font-semibold'>Basic Info</h2>

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
    </section>
  );
}
