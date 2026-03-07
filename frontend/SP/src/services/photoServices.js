import { buildFormData } from "../utils/photoFormat";
import { API_BASE_URL } from "../config/api";

export async function uploadPhotoToDrive({ uri, file }) {
  const formData = await buildFormData({ uri, file });
  const response = await fetch(`${API_BASE_URL}/api/photos/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }
  return response.json();
}


export async function sendPhotoToGenerate(imageUrl) {
  
  const response = await fetch(`${API_BASE_URL}/api/photos/generate`, {
    method: "POST",
    body: imageUrl,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }
  return response.json();
}