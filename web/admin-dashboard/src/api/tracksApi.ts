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

export function createTrack(body: CreateTrackRequest) {
  return apiPost<TrackListItem, CreateTrackRequest>("/api/v1/tracks", body);
}

export function updateTrack(id: string, body: UpdateTrackRequest) {
  return apiPut<TrackListItem, UpdateTrackRequest>(
    `/api/v1/tracks/${id}`,
    body,
  );
}

export function deleteTrack(id: string) {
  return apiDelete(`/api/v1/tracks/${id}`);
}
