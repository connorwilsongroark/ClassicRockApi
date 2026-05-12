// src/api/dashboardApi.ts

import { apiGet } from "@/lib/apiClient";

export type DashboardResponse = {
  totals: DashboardTotals;
  needsAttention: DashboardNeedsAttention;
};

export type DashboardTotals = {
  albums: number;
  artists: number;
  genres: number;
  tracks: number;
};

export type DashboardNeedsAttention = {
  albumsWithoutArtists: number;
  albumsWithoutGenres: number;
  albumsWithoutTracks: number;
  albumsWithoutPrimaryGenre: number;
  tracksWithoutAlbums: number;
};

export function getDashboard() {
  return apiGet<DashboardResponse>("/api/v1/dashboard");
}
