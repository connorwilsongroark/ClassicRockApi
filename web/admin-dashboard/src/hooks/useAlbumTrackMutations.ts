import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addTrackToAlbum,
  removeTrackFromAlbum,
  updateAlbumTrack,
  type AddAlbumTrackRequest,
} from "@/api/albumTracksApi";

export function useAlbumTrackMutations(albumId: string) {
  const queryClient = useQueryClient();

  const invalidateAlbumDetail = () => {
    queryClient.invalidateQueries({ queryKey: ["albums", albumId] });
  };

  const addTrackMutation = useMutation({
    mutationFn: (body: AddAlbumTrackRequest) => addTrackToAlbum(albumId, body),
    onSuccess: invalidateAlbumDetail,
  });

  const updateTrackMutation = useMutation({
    mutationFn: ({
      trackId,
      trackNumber,
    }: {
      trackId: string;
      trackNumber: number;
    }) => updateAlbumTrack(albumId, trackId, { trackNumber }),
    onSuccess: invalidateAlbumDetail,
  });

  const removeTrackMutation = useMutation({
    mutationFn: (trackId: string) => removeTrackFromAlbum(albumId, trackId),
    onSuccess: invalidateAlbumDetail,
  });

  return {
    addTrackMutation,
    updateTrackMutation,
    removeTrackMutation,
  };
}
