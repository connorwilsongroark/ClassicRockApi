import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createArtist, deleteArtist, updateArtist } from "@/api/artistsApi";

export function useArtistMutations() {
  const queryClient = useQueryClient();

  const { getAccessTokenSilently } = useAuth0();

  const invalidateArtists = () => {
    queryClient.invalidateQueries({ queryKey: ["artists"] });
  };

  const createArtistMutation = useMutation({
    mutationFn: async (body: {
      name: string;
      country: string | null;
      formedYear: number | null;
    }) => {
      const token = await getAccessTokenSilently();

      return createArtist(body, token);
    },
    onSuccess: invalidateArtists,
  });

  const updateArtistMutation = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: {
        name: string;
        country: string | null;
        formedYear: number | null;
      };
    }) => {
      const token = await getAccessTokenSilently();

      return updateArtist(id, body, token);
    },
    onSuccess: invalidateArtists,
  });

  const deleteArtistMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getAccessTokenSilently();

      return deleteArtist(id, token);
    },
    onSuccess: invalidateArtists,
  });

  return {
    createArtistMutation,
    updateArtistMutation,
    deleteArtistMutation,
  };
}
