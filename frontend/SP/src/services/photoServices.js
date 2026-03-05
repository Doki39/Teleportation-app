import { buildFormData } from "../utils/photoFormat";
import { API_BASE_URL } from "../config/api";

export async function sendPhotoToGenerate({ uri, file }) {
  const formData = await buildFormData({ uri, file });
  const response = await fetch(`${API_BASE_URL}/api/photos/generate`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }
  return response.json();
}