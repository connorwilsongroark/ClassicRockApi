import { apiDelete, apiPost, apiPut } from "@/lib/apiClient";

export type AddAlbumTrackRequest = {
  trackId: string;
  trackNumber: number;
};

export type UpdateAlbumTrackRequest = {
  trackNumber: number;
};

export function addTrackToAlbum(
  albumId: string,
  body: AddAlbumTrackRequest,
  token: string,
) {
  return apiPost<void, AddAlbumTrackRequest>(
    `/api/v1/albums/${albumId}/tracks`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function updateAlbumTrack(
  albumId: string,
  trackId: string,
  body: UpdateAlbumTrackRequest,
  token: string,
) {
  return apiPut<void, UpdateAlbumTrackRequest>(
    `/api/v1/albums/${albumId}/tracks/${trackId}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function removeTrackFromAlbum(
  albumId: string,
  trackId: string,
  token: string,
) {
  return apiDelete(`/api/v1/albums/${albumId}/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
