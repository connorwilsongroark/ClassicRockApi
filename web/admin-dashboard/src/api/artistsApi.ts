import { apiGet } from "@/lib/apiClient";

export type ArtistListItem = {
  id: string;
  name: string;
  country: string | null;
  formedYear: number | null;
};

export function getArtists() {
  return apiGet<ArtistListItem[]>("/api/v1/artists");
}
