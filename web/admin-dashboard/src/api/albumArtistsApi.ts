import { apiDelete, apiPost, apiPut } from "@/lib/apiClient";

export type AddAlbumArtistRequest = {
  artistId: string;
  role: number;
};

export type UpdateAlbumArtistRequest = {
  role: number;
};

export function addArtistToAlbum(albumId: string, body: AddAlbumArtistRequest) {
  return apiPost<void, AddAlbumArtistRequest>(
    `/api/v1/albums/${albumId}/artists`,
    body,
  );
}

export function updateAlbumArtist(
  albumId: string,
  artistId: string,
  body: UpdateAlbumArtistRequest,
) {
  return apiPut<void, UpdateAlbumArtistRequest>(
    `/api/v1/albums/${albumId}/artists/${artistId}`,
    body,
  );
}

export function removeArtistFromAlbum(albumId: string, artistId: string) {
  return apiDelete(`/api/v1/albums/${albumId}/artists/${artistId}`);
}
