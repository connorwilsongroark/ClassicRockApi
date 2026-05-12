import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClient";

export type TrackListItem = {
  id: string;
  name: string;
  duration: string | null;
};

// =========
// Requests
// =========
export type CreateTrackRequest = {
  name: string;
  duration: string | null;
};

export type UpdateTrackRequest = {
  name: string;
  duration: string | null;
};

// =========
// API Calls
// =========

export function getTracks() {
  return apiGet<TrackListItem[]>("/api/v1/tracks");
}

export function createTrack(body: CreateTrackRequest, token: string) {
  return apiPost<TrackListItem, CreateTrackRequest>("/api/v1/tracks", body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateTrack(
  id: string,
  body: UpdateTrackRequest,
  token: string,
) {
  return apiPut<TrackListItem, UpdateTrackRequest>(
    `/api/v1/tracks/${id}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function deleteTrack(id: string, token: string) {
  return apiDelete(`/api/v1/tracks/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
