import { apiDelete, apiPost, apiPut } from "@/lib/apiClient";

export type AddAlbumArtistRequest = {
  artistId: string;
  role: number;
};

export type UpdateAlbumArtistRequest = {
  role: number;
};

export function addArtistToAlbum(
  albumId: string,
  body: AddAlbumArtistRequest,
  token: string,
) {
  return apiPost<void, AddAlbumArtistRequest>(
    `/api/v1/albums/${albumId}/artists`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function updateAlbumArtist(
  albumId: string,
  artistId: string,
  body: UpdateAlbumArtistRequest,
  token: string,
) {
  return apiPut<void, UpdateAlbumArtistRequest>(
    `/api/v1/albums/${albumId}/artists/${artistId}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function removeArtistFromAlbum(
  albumId: string,
  artistId: string,
  token: string,
) {
  return apiDelete(`/api/v1/albums/${albumId}/artists/${artistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
