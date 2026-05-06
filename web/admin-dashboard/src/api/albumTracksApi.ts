import { apiDelete, apiPost, apiPut } from "@/lib/apiClient";

export type AddAlbumTrackRequest = {
  trackId: string;
  trackNumber: number;
};

export type UpdateAlbumTrackRequest = {
  trackNumber: number;
};

export function addTrackToAlbum(albumId: string, body: AddAlbumTrackRequest) {
  return apiPost<void, AddAlbumTrackRequest>(
    `/api/v1/albums/${albumId}/tracks`,
    body,
  );
}

export function updateAlbumTrack(
  albumId: string,
  trackId: string,
  body: UpdateAlbumTrackRequest,
) {
  return apiPut<void, UpdateAlbumTrackRequest>(
    `/api/v1/albums/${albumId}/tracks/${trackId}`,
    body,
  );
}

export function removeTrackFromAlbum(albumId: string, trackId: string) {
  return apiDelete(`/api/v1/albums/${albumId}/tracks/${trackId}`);
}
