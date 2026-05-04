import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAlbum, deleteAlbum, updateAlbum } from "@/api/albumsApi";

export function useAlbumMutations() {
  const queryClient = useQueryClient();

  const invalidateAlbums = () => {
    queryClient.invalidateQueries({ queryKey: ["albums"] });
  };

  const createAlbumMutation = useMutation({
    mutationFn: createAlbum,
    onSuccess: invalidateAlbums,
  });

  const updateAlbumMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: {
        title: string;
        releaseYear: number;
        curatedScore: number | null;
      };
    }) => updateAlbum(id, body),
    onSuccess: invalidateAlbums,
  });

  const deleteAlbumMutation = useMutation({
    mutationFn: deleteAlbum,
    onSuccess: invalidateAlbums,
  });

  return {
    createAlbumMutation,
    updateAlbumMutation,
    deleteAlbumMutation,
  };
}
