import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildFormData } from "../utils/photoFormat";
import { API_BASE_URL } from "../config/api";
import { getBearerAuthHeader, getJsonAuthHeaders } from "../utils/apiAuth";
import { throwFromFailedResponse } from "../utils/apiError";
import { ensureGuestSessionId } from "../utils/guestSession";

export async function uploadPhotoToDrive({ uri, file }) {
  const token = await AsyncStorage.getItem("token");
  const formData = await buildFormData({ uri, file });
  if (!token) {
    formData.append("guestSessionId", await ensureGuestSessionId());
  }
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
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
  const token = await AsyncStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const body = { imageUrl, promptId };
  if (!token) {
    body.guestSessionId = await ensureGuestSessionId();
  }
  const response = await fetch(`${API_BASE_URL}/api/photos/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throwFromFailedResponse(response.status, text);
  }
  return text ? JSON.parse(text) : null;
}