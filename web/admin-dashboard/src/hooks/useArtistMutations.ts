import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createArtist, deleteArtist, updateArtist } from "@/api/artistsApi";

export function useArtistMutations() {
  const queryClient = useQueryClient();

  const invalidateArtists = () => {
    queryClient.invalidateQueries({ queryKey: ["artists"] });
  };

  const createArtistMutation = useMutation({
    mutationFn: createArtist,
    onSuccess: invalidateArtists,
  });

  const updateArtistMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: {
        name: string;
        country: string | null;
        formedYear: number | null;
      };
    }) => updateArtist(id, body),
    onSuccess: invalidateArtists,
  });

  const deleteArtistMutation = useMutation({
    mutationFn: deleteArtist,
    onSuccess: invalidateArtists,
  });

  return {
    createArtistMutation,
    updateArtistMutation,
    deleteArtistMutation,
  };
}
