import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClient";

export type GenreListItem = {
  id: string;
  name: string;
};

// =========
// Requests
// =========
export type CreateGenreRequest = {
  name: string;
};

export type UpdateGenreRequest = {
  name: string;
};

// =========
// API Calls
// =========
export function getGenres() {
  return apiGet<GenreListItem[]>("/api/v1/genres");
}

export function createGenre(body: CreateGenreRequest) {
  return apiPost<GenreListItem, CreateGenreRequest>("/api/v1/genres", body);
}

export function updateGenre(id: string, body: UpdateGenreRequest) {
  return apiPut<GenreListItem, UpdateGenreRequest>(
    `/api/v1/genres/${id}`,
    body,
  );
}

export function deleteGenre(id: string) {
  return apiDelete(`/api/v1/genres/${id}`);
}
