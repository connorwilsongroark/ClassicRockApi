import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getArtists, type ArtistListItem } from "@/api/artistsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreateArtistDialog } from "@/components/artists/CreateArtistDialog";
import { EditArtistDialog } from "@/components/artists/EditArtistDialog";
import { DeleteArtistDialog } from "@/components/artists/DeleteArtistDialog";

export default function ArtistsPage() {
  const [searchText, setSearchText] = useState("");
  const [editingArtist, setEditingArtist] = useState<ArtistListItem | null>(
    null,
  );
  const [artistToDelete, setArtistToDelete] = useState<ArtistListItem | null>(
    null,
  );

  const {
    data: artists = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["artists"],
    queryFn: getArtists,
  });

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title='Artists'
        description='Create, edit, and manage artist records.'
        actions={<CreateArtistDialog />}
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

        {error && (
          <div className='p-6 text-sm text-destructive'>
            Could not load artists.
          </div>
        )}

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

                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setEditingArtist(artist)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => setArtistToDelete(artist)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <EditArtistDialog
        artist={editingArtist}
        open={editingArtist !== null}
        onOpenChange={(open) => {
          if (!open) setEditingArtist(null);
        }}
      />

      <DeleteArtistDialog
        artist={artistToDelete}
        open={artistToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setArtistToDelete(null);
        }}
      />
    </div>
  );
}
