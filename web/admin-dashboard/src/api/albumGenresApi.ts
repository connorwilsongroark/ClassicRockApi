import { apiDelete, apiPost, apiPut } from "@/lib/apiClient";

export type AddAlbumGenreRequest = {
  genreId: string;
  isPrimary: boolean;
};

export type UpdateAlbumGenreRequest = {
  isPrimary: boolean;
};

export function addGenreToAlbum(
  albumId: string,
  body: AddAlbumGenreRequest,
  token: string,
) {
  return apiPost<void, AddAlbumGenreRequest>(
    `/api/v1/albums/${albumId}/genres`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function updateAlbumGenre(
  albumId: string,
  genreId: string,
  body: UpdateAlbumGenreRequest,
  token: string,
) {
  return apiPut<void, UpdateAlbumGenreRequest>(
    `/api/v1/albums/${albumId}/genres/${genreId}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function removeGenreFromAlbum(
  albumId: string,
  genreId: string,
  token: string,
) {
  return apiDelete(`/api/v1/albums/${albumId}/genres/${genreId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
