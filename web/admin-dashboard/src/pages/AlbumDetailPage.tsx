import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAlbumById } from "@/api/albumsApi";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlbumBasicInfoCard } from "@/components/albums/AlbumBasicInfoCard";
import { AlbumArtistsSection } from "@/components/albums/AlbumArtistsSection";
import { AlbumGenresSection } from "@/components/albums/AlbumGenresSection";
import { AlbumTracksSection } from "@/components/albums/AlbumTracksSection";

export default function AlbumDetailPage() {
  const { albumId } = useParams<{ albumId: string }>();

  const {
    data: album,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["albums", albumId],
    queryFn: () => getAlbumById(albumId!),
    enabled: !!albumId,
  });

  if (isLoading) {
    return <div className='text-sm'>Loading album...</div>;
  }

  if (error || !album) {
    return (
      <div>
        <p className='mb-4 text-sm text-destructive'>Could not load album.</p>
        <Button asChild variant='outline'>
          <Link to='/albums'>Back to Albums</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={album.title}
        description={`${album.releaseYear}${
          album.curatedScore !== null ? ` · Score: ${album.curatedScore}` : ""
        }`}
        actions={
          <Button asChild variant='outline'>
            <Link to='/albums'>Back to Albums</Link>
          </Button>
        }
      />

      <div className='grid gap-6'>
        <AlbumBasicInfoCard album={album} />
        <AlbumArtistsSection albumId={album.id} artists={album.artists} />
        <AlbumGenresSection albumId={album.id} genres={album.genres} />
        <AlbumTracksSection albumId={album.id} tracks={album.tracks} />
      </div>
    </div>
  );
}
