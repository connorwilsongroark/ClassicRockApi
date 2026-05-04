import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGenre, deleteGenre, updateGenre } from "@/api/genresApi";

export function useGenreMutations() {
  const queryClient = useQueryClient();

  const invalidateGenres = () => {
    queryClient.invalidateQueries({ queryKey: ["genres"] });
  };

  const createGenreMutation = useMutation({
    mutationFn: createGenre,
    onSuccess: invalidateGenres,
  });

  const updateGenreMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: {
        name: string;
      };
    }) => updateGenre(id, body),
    onSuccess: invalidateGenres,
  });

  const deleteGenreMutation = useMutation({
    mutationFn: deleteGenre,
    onSuccess: invalidateGenres,
  });

  return {
    createGenreMutation,
    updateGenreMutation,
    deleteGenreMutation,
  };
}
