import { buildFormData } from "../utils/photoFormat";
import { API_BASE_URL } from "../config/api";
import { getBearerAuthHeader, getJsonAuthHeaders } from "../utils/apiAuth";

function throwFromFailedResponse(status, text) {
  const trimmed = (text || "").trim();
  if (trimmed) {
    try {
      const data = JSON.parse(trimmed);
      if (data?.message) {
        const err = new Error(String(data.message));
        if (data.code) err.code = data.code;
        throw err;
      }
      if (typeof data?.error === "string") {
        const err = new Error(data.error);
        if (data.code) err.code = data.code;
        throw err;
      }
    } catch (e) {
      if (!(e instanceof SyntaxError)) throw e;
    }
  }
  throw new Error(trimmed ? `${status}: ${trimmed}` : `Server responded with ${status}`);
}

export async function uploadPhotoToDrive({ uri, file }) {
  const headers = await getBearerAuthHeader();
  const formData = await buildFormData({ uri, file });
  const response = await fetch(`${API_BASE_URL}/api/photos/upload`, {
    method: "POST",
    headers,
    body: formData,
  });
  const text = await response.text();
  if (!response.ok) {
    throwFromFailedResponse(response.status, text);
  }
  return text ? JSON.parse(text) : {};
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
  const text = await response.text();
  if (!response.ok) {
    throwFromFailedResponse(response.status, text);
  }
  return text ? JSON.parse(text) : null;
}