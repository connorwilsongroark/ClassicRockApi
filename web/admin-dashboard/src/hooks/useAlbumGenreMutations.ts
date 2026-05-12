import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addGenreToAlbum,
  removeGenreFromAlbum,
  updateAlbumGenre,
  type AddAlbumGenreRequest,
} from "@/api/albumGenresApi";

export function useAlbumGenreMutations(albumId: string) {
  const queryClient = useQueryClient();

  const { getAccessTokenSilently } = useAuth0();

  const invalidateAlbumDetail = () => {
    queryClient.invalidateQueries({ queryKey: ["albums", albumId] });
  };

  // =========
  // ADD GENRE
  // =========
  const addGenreMutation = useMutation({
    mutationFn: async (body: AddAlbumGenreRequest) => {
      const token = await getAccessTokenSilently();

      return addGenreToAlbum(albumId, body, token);
    },
    onSuccess: invalidateAlbumDetail,
  });

  // =========
  // SET PRIMARY / UPDATE
  // =========
  const updateGenreMutation = useMutation({
    mutationFn: async ({
      genreId,
      isPrimary,
    }: {
      genreId: string;
      isPrimary: boolean;
    }) => {
      const token = await getAccessTokenSilently();

      return updateAlbumGenre(
        albumId,
        genreId,
        {
          isPrimary,
        },
        token,
      );
    },
    onSuccess: invalidateAlbumDetail,
  });

  // =========
  // REMOVE GENRE
  // =========
  const removeGenreMutation = useMutation({
    mutationFn: async (genreId: string) => {
      const token = await getAccessTokenSilently();

      return removeGenreFromAlbum(albumId, genreId, token);
    },
    onSuccess: invalidateAlbumDetail,
  });

  return {
    addGenreMutation,
    updateGenreMutation,
    removeGenreMutation,
  };
}
