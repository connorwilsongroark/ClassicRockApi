import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addTrackToAlbum,
  removeTrackFromAlbum,
  updateAlbumTrack,
  type AddAlbumTrackRequest,
} from "@/api/albumTracksApi";

export function useAlbumTrackMutations(albumId: string) {
  const queryClient = useQueryClient();

  const { getAccessTokenSilently } = useAuth0();

  const invalidateAlbumDetail = () => {
    queryClient.invalidateQueries({ queryKey: ["albums", albumId] });
  };

  const addTrackMutation = useMutation({
    mutationFn: async (body: AddAlbumTrackRequest) => {
      const token = await getAccessTokenSilently();

      return addTrackToAlbum(albumId, body, token);
    },
    onSuccess: invalidateAlbumDetail,
  });

  const updateTrackMutation = useMutation({
    mutationFn: async ({
      trackId,
      trackNumber,
    }: {
      trackId: string;
      trackNumber: number;
    }) => {
      const token = await getAccessTokenSilently();

      return updateAlbumTrack(albumId, trackId, { trackNumber }, token);
    },
    onSuccess: invalidateAlbumDetail,
  });

  const removeTrackMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const token = await getAccessTokenSilently();

      return removeTrackFromAlbum(albumId, trackId, token);
    },
    onSuccess: invalidateAlbumDetail,
  });

  return {
    addTrackMutation,
    updateTrackMutation,
    removeTrackMutation,
  };
}
