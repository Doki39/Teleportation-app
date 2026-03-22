import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const data = await response.json();
  return data;
}

export async function generatePromptPreview({ imageUrl, modifyText }) {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Not logged in");
  const response = await fetch(`${API_BASE_URL}/api/photos/generate-preview`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl, modifyText }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }
  return response.json();
}

export async function sendPhotoToGenerate(imageUrl, promptId) {
  const response = await fetch(`${API_BASE_URL}/api/photos/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl, promptId }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }
  return response.json();
}