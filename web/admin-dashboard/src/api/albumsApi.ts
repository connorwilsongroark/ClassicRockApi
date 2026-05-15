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

export type QuickAddAlbumTrackRequest = {
  name: string;
  duration: string;
};

export type QuickAddAlbumRequest = {
  title: string;
  releaseYear: number;
  curatedScore: number | null;
  tracks: QuickAddAlbumTrackRequest[];
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

export function createAlbum(body: CreateAlbumRequest, token: string) {
  return apiPost<AlbumListItem, CreateAlbumRequest>("/api/v1/albums", body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function quickAddAlbum(body: QuickAddAlbumRequest, token: string) {
  return apiPost<AlbumDetail, QuickAddAlbumRequest>(
    "/api/v1/albums/quick-add",
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function updateAlbum(
  id: string,
  body: UpdateAlbumRequest,
  token: string,
) {
  return apiPut<AlbumListItem, UpdateAlbumRequest>(
    `/api/v1/albums/${id}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function deleteAlbum(id: string, token: string) {
  return apiDelete(`/api/v1/albums/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
