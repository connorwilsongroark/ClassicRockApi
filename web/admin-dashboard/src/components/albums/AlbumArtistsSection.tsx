import { useState } from "react";
import type { AlbumArtist } from "@/api/albumsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AddAlbumArtistDialog } from "./AddAlbumArtistDialog";
import { useAlbumArtistMutations } from "@/hooks/useAlbumArtistMutations";
import { useAuthPermissions } from "@/hooks/useAuthPermissions";

type AlbumArtistsSectionProps = {
  albumId: string;
  artists: AlbumArtist[];
};

const artistRoles = [
  { value: 1, label: "Primary" },
  { value: 2, label: "Featured" },
  { value: 3, label: "Composer" },
  { value: 4, label: "Producer" },
  { value: 5, label: "Various" },
];

function getRoleLabel(role: number) {
  return artistRoles.find((x) => x.value === role)?.label ?? `Role ${role}`;
}

export function AlbumArtistsSection({
  albumId,
  artists,
}: AlbumArtistsSectionProps) {
  const { hasPermission } = useAuthPermissions();
  const canManageAlbumArtists = hasPermission("manage:album-artists");

  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const { updateArtistMutation, removeArtistMutation } =
    useAlbumArtistMutations(albumId);

  function handleRemoveArtist(artistId: string) {
    removeArtistMutation.mutate(artistId);
  }

  return (
    <section className='rounded-md border bg-background p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Artists</h2>
        {canManageAlbumArtists && (
          <AddAlbumArtistDialog albumId={albumId} currentArtists={artists} />
        )}
      </div>

      {artists.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          No artists associated with this album.
        </p>
      ) : (
        <div className='space-y-3'>
          {artists.map((artist) => (
            <div
              key={artist.artistId}
              className='flex items-center justify-between rounded-md border p-4'
            >
              <div>
                <div className='font-medium'>{artist.artistName}</div>
                <div className='mt-1'>
                  <Badge variant='secondary'>{getRoleLabel(artist.role)}</Badge>
                </div>
              </div>
              {canManageAlbumArtists && (
                <div className='flex gap-2'>
                  <Popover
                    open={openPopoverId === artist.artistId}
                    onOpenChange={(open) =>
                      setOpenPopoverId(open ? artist.artistId : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={updateArtistMutation.isPending}
                      >
                        Change Role
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className='w-48 p-2' align='end'>
                      <div className='space-y-1'>
                        {artistRoles.map((role) => (
                          <Button
                            key={role.value}
                            variant={
                              artist.role === role.value ? "secondary" : "ghost"
                            }
                            size='sm'
                            className='w-full justify-start'
                            onClick={() => {
                              updateArtistMutation.mutate(
                                {
                                  artistId: artist.artistId,
                                  role: role.value,
                                },
                                {
                                  onSuccess: () => setOpenPopoverId(null),
                                },
                              );
                            }}
                          >
                            {role.label}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant='destructive'
                        size='sm'
                        disabled={removeArtistMutation.isPending}
                      >
                        Remove
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Artist</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove{" "}
                          <span className='font-medium text-foreground'>
                            {artist.artistName}
                          </span>{" "}
                          from this album?
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                          className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                          onClick={() => handleRemoveArtist(artist.artistId)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {updateArtistMutation.isError && (
        <p className='mt-4 text-sm text-destructive'>
          Could not update artist role.
        </p>
      )}

      {removeArtistMutation.isError && (
        <p className='mt-4 text-sm text-destructive'>
          Could not remove artist.
        </p>
      )}
    </section>
  );
}
