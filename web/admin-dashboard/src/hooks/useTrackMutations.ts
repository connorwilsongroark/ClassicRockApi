import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTrack, deleteTrack, updateTrack } from "@/api/tracksApi";

export function useTrackMutations() {
  const queryClient = useQueryClient();

  const invalidateTracks = () => {
    queryClient.invalidateQueries({ queryKey: ["tracks"] });
  };

  const createTrackMutation = useMutation({
    mutationFn: createTrack,
    onSuccess: invalidateTracks,
  });

  const updateTrackMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: {
        name: string;
        duration: string | null;
      };
    }) => updateTrack(id, body),
    onSuccess: invalidateTracks,
  });

  const deleteTrackMutation = useMutation({
    mutationFn: deleteTrack,
    onSuccess: invalidateTracks,
  });

  return {
    createTrackMutation,
    updateTrackMutation,
    deleteTrackMutation,
  };
}
