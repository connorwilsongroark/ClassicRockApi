import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createGenre, deleteGenre, updateGenre } from "@/api/genresApi";

export function useGenreMutations() {
  const queryClient = useQueryClient();

  const { getAccessTokenSilently } = useAuth0();

  const invalidateGenres = () => {
    queryClient.invalidateQueries({ queryKey: ["genres"] });
  };

  const createGenreMutation = useMutation({
    mutationFn: async (body: { name: string }) => {
      const token = await getAccessTokenSilently();

      return createGenre(body, token);
    },
    onSuccess: invalidateGenres,
  });

  const updateGenreMutation = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: {
        name: string;
      };
    }) => {
      const token = await getAccessTokenSilently();

      return updateGenre(id, body, token);
    },
    onSuccess: invalidateGenres,
  });

  const deleteGenreMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getAccessTokenSilently();

      return deleteGenre(id, token);
    },
    onSuccess: invalidateGenres,
  });

  return {
    createGenreMutation,
    updateGenreMutation,
    deleteGenreMutation,
  };
}
