import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/api/dashboardApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { NeedsAttentionCard } from "@/components/dashboard/NeedsAttentionCard";

export default function DashboardPage() {
  const {
    data: dashboard,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  if (isLoading) {
    return <div className='text-sm'>Loading dashboard...</div>;
  }

  if (error || !dashboard) {
    return (
      <div className='text-sm text-destructive'>Could not load dashboard.</div>
    );
  }

  const needsAttentionItems = [
    {
      label: "Albums without artists",
      value: dashboard.needsAttention.albumsWithoutArtists,
    },
    {
      label: "Albums without genres",
      value: dashboard.needsAttention.albumsWithoutGenres,
    },
    {
      label: "Albums without tracks",
      value: dashboard.needsAttention.albumsWithoutTracks,
    },
    {
      label: "Albums without primary genre",
      value: dashboard.needsAttention.albumsWithoutPrimaryGenre,
    },
    {
      label: "Tracks without albums",
      value: dashboard.needsAttention.tracksWithoutAlbums,
    },
  ].filter((item) => item.value > 0);

  return (
    <div>
      <PageHeader
        title='Dashboard'
        description='Review catalog totals and records that may need cleanup.'
        actions={
          <Button asChild>
            <Link to='/albums'>Manage Albums</Link>
          </Button>
        }
      />

      <div className='grid gap-6'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <DashboardStatCard label='Albums' value={dashboard.totals.albums} />
          <DashboardStatCard label='Artists' value={dashboard.totals.artists} />
          <DashboardStatCard label='Genres' value={dashboard.totals.genres} />
          <DashboardStatCard label='Tracks' value={dashboard.totals.tracks} />
        </div>

        <NeedsAttentionCard items={needsAttentionItems} />

        <section className='rounded-md border bg-background p-6'>
          <h2 className='mb-4 text-lg font-semibold'>Quick Actions</h2>

          <div className='flex flex-wrap gap-2'>
            <Button asChild variant='outline'>
              <Link to='/albums'>Albums</Link>
            </Button>

            <Button asChild variant='outline'>
              <Link to='/artists'>Artists</Link>
            </Button>

            <Button asChild variant='outline'>
              <Link to='/genres'>Genres</Link>
            </Button>

            <Button asChild variant='outline'>
              <Link to='/tracks'>Tracks</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
