import { API_BASE_URL } from "../config/api";

export async function fetchPublicConfig() {
  const response = await fetch(`${API_BASE_URL}/api/config/public`);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}
