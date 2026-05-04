import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";

export type AlbumListItem = {
  id: string;
  title: string;
  releaseYear: number;
  curatedScore: number | null;
};

// =========
// Requests
// =========

export type CreateAlbumRequest = {
  title: string;
  releaseYear: number;
  curatedScore?: number | null;
};

export type UpdateAlbumRequest = {
  title: string;
  releaseYear: number;
  curatedScore?: number | null;
};

// =========
// API Calls
// =========

export function getAlbums() {
  return apiGet<AlbumListItem[]>("/api/v1/albums");
}

export function createAlbum(body: CreateAlbumRequest) {
  return apiPost<AlbumListItem, CreateAlbumRequest>("/api/v1/albums", body);
}

export function updateAlbum(id: string, body: UpdateAlbumRequest) {
  return apiPut<AlbumListItem, UpdateAlbumRequest>(
    `/api/v1/albums/${id}`,
    body,
  );
}

export function deleteAlbum(id: string) {
  return apiDelete(`/api/v1/albums/${id}`);
}
