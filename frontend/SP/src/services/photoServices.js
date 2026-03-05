import { buildFormData } from "../utils/photoFormat";
import { API_BASE_URL } from "../config/api";

export async function sendPhotoToAnalyze({ uri, file }) {
  const formData = await buildFormData({ uri, file });
  const response = await fetch(`${API_BASE_URL}/api/vehicle/analyze`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }
  return response.json();
}

export async function uploadKeyPhoto({ uri, file }) {
  const formData = await buildFormData({ uri, file });
  const response = await fetch(`${API_BASE_URL}/api/vehicle/keyUrl`, {
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