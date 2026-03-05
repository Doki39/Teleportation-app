import { API_BASE_URL } from "../config/api";

export async function getGeneratedPhotos() {
  const response = await fetch(`${API_BASE_URL}/api/photos`, {
    method: "GET",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }

  return response.json();
}