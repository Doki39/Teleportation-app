import { API_BASE_URL } from "../config/api";
import { getBearerAuthHeader } from "../utils/apiAuth";

export function normalizePhotosListResponse(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

export async function getGeneratedPhotos({ page = 1, limit = 10 } = {}) {
  const headers = await getBearerAuthHeader();
  const response = await fetch(`${API_BASE_URL}/api/photos?page=${page}&limit=${limit}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }

  return response.json();
}

export async function getPhotosForSlide() {
  const response = await fetch(`${API_BASE_URL}/api/photos/slides`, {
    method: "GET",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }

  return response.json();
}