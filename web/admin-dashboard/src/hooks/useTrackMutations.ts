import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTrack, deleteTrack, updateTrack } from "@/api/tracksApi";

export function useTrackMutations() {
  const queryClient = useQueryClient();

  const { getAccessTokenSilently } = useAuth0();

  const invalidateTracks = () => {
    queryClient.invalidateQueries({ queryKey: ["tracks"] });
  };

  const createTrackMutation = useMutation({
    mutationFn: async (body: { name: string; duration: string | null }) => {
      const token = await getAccessTokenSilently();

      return createTrack(body, token);
    },
    onSuccess: invalidateTracks,
  });

  const updateTrackMutation = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: {
        name: string;
        duration: string | null;
      };
    }) => {
      const token = await getAccessTokenSilently();

      return updateTrack(id, body, token);
    },
    onSuccess: invalidateTracks,
  });

  const deleteTrackMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getAccessTokenSilently();

      return deleteTrack(id, token);
    },
    onSuccess: invalidateTracks,
  });

  return {
    createTrackMutation,
    updateTrackMutation,
    deleteTrackMutation,
  };
}
