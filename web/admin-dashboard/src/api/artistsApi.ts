import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClient";

export type ArtistListItem = {
  id: string;
  name: string;
  country: string | null;
  formedYear: number | null;
};

// =========
// Requests
// =========
export type CreateArtistRequest = {
  name: string;
  country: string | null;
  formedYear: number | null;
};

export type UpdateArtistRequest = {
  name: string;
  country: string | null;
  formedYear: number | null;
};

// =========
// API Calls
// =========
export function getArtists() {
  return apiGet<ArtistListItem[]>("/api/v1/artists");
}

export function createArtist(body: CreateArtistRequest, token: string) {
  return apiPost<ArtistListItem, CreateArtistRequest>("/api/v1/artists", body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateArtist(
  id: string,
  body: UpdateArtistRequest,
  token: string,
) {
  return apiPut<ArtistListItem, UpdateArtistRequest>(
    `/api/v1/artists/${id}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function deleteArtist(id: string, token: string) {
  return apiDelete(`/api/v1/artists/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
