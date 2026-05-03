import { apiGet } from "@/lib/apiClient";

export type GenreListItem = {
  id: string;
  name: string;
};

export function getGenres() {
  return apiGet<GenreListItem[]>("/api/v1/genres");
}
