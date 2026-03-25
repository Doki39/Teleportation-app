import { buildFormData } from "../utils/photoFormat";
import { API_BASE_URL } from "../config/api";
import { getBearerAuthHeader, getJsonAuthHeaders } from "../utils/apiAuth";

export async function uploadPhotoToDrive({ uri, file }) {
  const headers = await getBearerAuthHeader();
  const formData = await buildFormData({ uri, file });
  const response = await fetch(`${API_BASE_URL}/api/photos/upload`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }
  const data = await response.json();
  return data;
}

export async function generatePromptPreview({ imageUrl, modifyText }) {
  const headers = await getJsonAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/photos/generate-preview`, {
    method: "POST",
    headers,
    body: JSON.stringify({ imageUrl, modifyText }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }
  return response.json();
}

export async function sendPhotoToGenerate(imageUrl, promptId) {
  const headers = await getJsonAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/photos/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ imageUrl, promptId }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }
  return response.json();
}