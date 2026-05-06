import { apiDelete, apiPost, apiPut } from "@/lib/apiClient";

export type AddAlbumGenreRequest = {
  genreId: string;
  isPrimary: boolean;
};

export type UpdateAlbumGenreRequest = {
  isPrimary: boolean;
};

export function addGenreToAlbum(albumId: string, body: AddAlbumGenreRequest) {
  return apiPost<void, AddAlbumGenreRequest>(
    `/api/v1/albums/${albumId}/genres`,
    body,
  );
}

export function updateAlbumGenre(
  albumId: string,
  genreId: string,
  body: UpdateAlbumGenreRequest,
) {
  return apiPut<void, UpdateAlbumGenreRequest>(
    `/api/v1/albums/${albumId}/genres/${genreId}`,
    body,
  );
}

export function removeGenreFromAlbum(albumId: string, genreId: string) {
  return apiDelete(`/api/v1/albums/${albumId}/genres/${genreId}`);
}
