import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTracks, type TrackListItem } from "@/api/tracksApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreateTrackDialog } from "@/components/tracks/CreateTrackDialog";
import { EditTrackDialog } from "@/components/tracks/EditTrackDialog";
import { DeleteTrackDialog } from "@/components/tracks/DeleteTrackDialog";
import { useAuthPermissions } from "@/hooks/useAuthPermissions";

export default function TracksPage() {
  const { hasPermission } = useAuthPermissions();
  const canUpdateTracks = hasPermission("update:tracks");
  const canDeleteTracks = hasPermission("delete:tracks");

  const [searchText, setSearchText] = useState("");
  const [editingTrack, setEditingTrack] = useState<TrackListItem | null>(null);
  const [trackToDelete, setTrackToDelete] = useState<TrackListItem | null>(
    null,
  );

  const {
    data: tracks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tracks"],
    queryFn: getTracks,
  });

  const filteredTracks = tracks.filter((track) =>
    track.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title='Tracks'
        description='Create, edit, and manage track records.'
        actions={<CreateTrackDialog />}
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

        {error && (
          <div className='p-6 text-sm text-destructive'>
            Could not load tracks.
          </div>
        )}

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

                    <div className='flex gap-2'>
                      {canUpdateTracks && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setEditingTrack(track)}
                        >
                          Edit
                        </Button>
                      )}
                      {canDeleteTracks && (
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => setTrackToDelete(track)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <EditTrackDialog
        track={editingTrack}
        open={editingTrack !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTrack(null);
        }}
      />

      <DeleteTrackDialog
        track={trackToDelete}
        open={trackToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setTrackToDelete(null);
        }}
      />
    </div>
  );
}
