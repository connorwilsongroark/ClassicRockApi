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

export function createGenre(body: CreateGenreRequest, token: string) {
  return apiPost<GenreListItem, CreateGenreRequest>("/api/v1/genres", body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateGenre(
  id: string,
  body: UpdateGenreRequest,
  token: string,
) {
  return apiPut<GenreListItem, UpdateGenreRequest>(
    `/api/v1/genres/${id}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function deleteGenre(id: string, token: string) {
  return apiDelete(`/api/v1/genres/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
