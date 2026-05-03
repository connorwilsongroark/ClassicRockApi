import { apiGet } from "@/lib/apiClient";

export type TrackListItem = {
  id: string;
  name: string;
  duration: string | null;
};

export function getTracks() {
  return apiGet<TrackListItem[]>("/api/v1/tracks");
}
