import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";

// =========
// Types
// =========

export type AlbumListItem = {
  id: string;
  title: string;
  releaseYear: number;
  curatedScore: number | null;
};

export type AlbumArtist = {
  artistId: string;
  artistName: string;
  role: number;
};

export type AlbumGenre = {
  genreId: string;
  genreName: string;
  isPrimary: boolean;
};

export type AlbumTrack = {
  trackId: string;
  trackName: string;
  trackNumber: number;
  duration: string | null;
};

export type AlbumDetail = {
  id: string;
  title: string;
  releaseYear: number;
  curatedScore: number | null;
  artists: AlbumArtist[];
  genres: AlbumGenre[];
  tracks: AlbumTrack[];
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

export function getAlbumById(id: string) {
  return apiGet<AlbumDetail>(`/api/v1/albums/${id}`);
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
