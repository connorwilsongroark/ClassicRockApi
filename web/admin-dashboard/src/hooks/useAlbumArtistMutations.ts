import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addArtistToAlbum,
  removeArtistFromAlbum,
  updateAlbumArtist,
  type AddAlbumArtistRequest,
} from "@/api/albumArtistsApi";

export function useAlbumArtistMutations(albumId: string) {
  const queryClient = useQueryClient();

  const invalidateAlbumDetail = () => {
    queryClient.invalidateQueries({ queryKey: ["albums", albumId] });
  };

  const addArtistMutation = useMutation({
    mutationFn: (body: AddAlbumArtistRequest) =>
      addArtistToAlbum(albumId, body),
    onSuccess: invalidateAlbumDetail,
  });

  const updateArtistMutation = useMutation({
    mutationFn: ({ artistId, role }: { artistId: string; role: number }) =>
      updateAlbumArtist(albumId, artistId, { role }),
    onSuccess: invalidateAlbumDetail,
  });

  const removeArtistMutation = useMutation({
    mutationFn: (artistId: string) => removeArtistFromAlbum(albumId, artistId),
    onSuccess: invalidateAlbumDetail,
  });

  return {
    addArtistMutation,
    updateArtistMutation,
    removeArtistMutation,
  };
}
