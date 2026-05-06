import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addGenreToAlbum,
  removeGenreFromAlbum,
  updateAlbumGenre,
  type AddAlbumGenreRequest,
} from "@/api/albumGenresApi";

export function useAlbumGenreMutations(albumId: string) {
  const queryClient = useQueryClient();

  const invalidateAlbumDetail = () => {
    queryClient.invalidateQueries({ queryKey: ["albums", albumId] });
  };

  // =========
  // ADD GENRE
  // =========
  const addGenreMutation = useMutation({
    mutationFn: (body: AddAlbumGenreRequest) => addGenreToAlbum(albumId, body),
    onSuccess: invalidateAlbumDetail,
  });

  // =========
  // SET PRIMARY / UPDATE
  // =========
  const updateGenreMutation = useMutation({
    mutationFn: ({
      genreId,
      isPrimary,
    }: {
      genreId: string;
      isPrimary: boolean;
    }) =>
      updateAlbumGenre(albumId, genreId, {
        isPrimary,
      }),
    onSuccess: invalidateAlbumDetail,
  });

  // =========
  // REMOVE GENRE
  // =========
  const removeGenreMutation = useMutation({
    mutationFn: (genreId: string) => removeGenreFromAlbum(albumId, genreId),
    onSuccess: invalidateAlbumDetail,
  });

  return {
    addGenreMutation,
    updateGenreMutation,
    removeGenreMutation,
  };
}
