import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addArtistToAlbum,
  removeArtistFromAlbum,
  updateAlbumArtist,
  type AddAlbumArtistRequest,
} from "@/api/albumArtistsApi";

export function useAlbumArtistMutations(albumId: string) {
  const queryClient = useQueryClient();

  const { getAccessTokenSilently } = useAuth0();

  const invalidateAlbumDetail = () => {
    queryClient.invalidateQueries({ queryKey: ["albums", albumId] });
  };

  const addArtistMutation = useMutation({
    mutationFn: async (body: AddAlbumArtistRequest) => {
      const token = await getAccessTokenSilently();

      return addArtistToAlbum(albumId, body, token);
    },
    onSuccess: invalidateAlbumDetail,
  });

  const updateArtistMutation = useMutation({
    mutationFn: async ({
      artistId,
      role,
    }: {
      artistId: string;
      role: number;
    }) => {
      const token = await getAccessTokenSilently();

      return updateAlbumArtist(albumId, artistId, { role }, token);
    },
    onSuccess: invalidateAlbumDetail,
  });

  const removeArtistMutation = useMutation({
    mutationFn: async (artistId: string) => {
      const token = await getAccessTokenSilently();

      return removeArtistFromAlbum(albumId, artistId, token);
    },
    onSuccess: invalidateAlbumDetail,
  });

  return {
    addArtistMutation,
    updateArtistMutation,
    removeArtistMutation,
  };
}
