import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createAlbum,
  deleteAlbum,
  updateAlbum,
  quickAddAlbum,
  type QuickAddAlbumRequest,
} from "@/api/albumsApi";

export function useAlbumMutations() {
  const queryClient = useQueryClient();

  const { getAccessTokenSilently } = useAuth0();

  const invalidateAlbums = () => {
    queryClient.invalidateQueries({ queryKey: ["albums"] });
  };

  const createAlbumMutation = useMutation({
    mutationFn: async (body: {
      title: string;
      releaseYear: number;
      curatedScore: number | null;
    }) => {
      const token = await getAccessTokenSilently();

      return createAlbum(body, token);
    },
    onSuccess: invalidateAlbums,
  });

  const quickAddAlbumMutation = useMutation({
    mutationFn: async (body: QuickAddAlbumRequest) => {
      const token = await getAccessTokenSilently();

      return quickAddAlbum(body, token);
    },
    onSuccess: invalidateAlbums,
  });

  const updateAlbumMutation = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: {
        title: string;
        releaseYear: number;
        curatedScore: number | null;
      };
    }) => {
      const token = await getAccessTokenSilently();

      return updateAlbum(id, body, token);
    },
    onSuccess: invalidateAlbums,
  });

  const deleteAlbumMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getAccessTokenSilently();

      return deleteAlbum(id, token);
    },
    onSuccess: invalidateAlbums,
  });

  return {
    createAlbumMutation,
    updateAlbumMutation,
    deleteAlbumMutation,
    quickAddAlbumMutation,
  };
}
