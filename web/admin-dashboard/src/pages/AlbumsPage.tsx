import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAlbums, type AlbumListItem } from "@/api/albumsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreateAlbumDialog } from "@/components/albums/CreateAlbumDialog";
import { EditAlbumDialog } from "@/components/albums/EditAlbumDialog";
import { DeleteAlbumDialog } from "@/components/albums/DeleteAlbumDialog";

export default function AlbumsPage() {
  // SEARCH
  const [searchText, setSearchText] = useState("");

  // EDIT ALBUM
  const [editingAlbum, setEditingAlbum] = useState<AlbumListItem | null>(null);

  // DELETE ALBUM
  const [albumToDelete, setAlbumToDelete] = useState<AlbumListItem | null>(
    null,
  );

  const {
    data: albums = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["albums"],
    queryFn: getAlbums,
  });

  const filteredAlbums = albums.filter((album) =>
    album.title.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title='Albums'
        description='Create, edit, and manage album records.'
        actions={<CreateAlbumDialog />}
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

        {error && (
          <div className='p-6 text-sm text-destructive'>
            Could not load albums.
          </div>
        )}

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
                      </div>
                    </div>

                    <div className='flex gap-2'>
                      <Button asChild variant='outline' size='sm'>
                        <Link to={`/albums/${album.id}`}>View</Link>
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setEditingAlbum(album)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => setAlbumToDelete(album)}
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
      <EditAlbumDialog
        album={editingAlbum}
        open={editingAlbum !== null}
        onOpenChange={(open) => {
          if (!open) setEditingAlbum(null);
        }}
      />
      <DeleteAlbumDialog
        album={albumToDelete}
        open={albumToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setAlbumToDelete(null);
        }}
      />
    </div>
  );
}
