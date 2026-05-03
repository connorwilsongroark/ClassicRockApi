import { apiGet } from "@/lib/apiClient";

export type AlbumListItem = {
  id: string;
  title: string;
  releaseYear: number;
  curatedScore: number | null;
};

export function getAlbums() {
  return apiGet<AlbumListItem[]>("/api/v1/albums");
}
