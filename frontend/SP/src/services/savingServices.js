import { API_BASE_URL } from "../config/api";

export async function saveDetails(payload) {
    const response = await fetch(`${API_BASE_URL}/api/vehicle/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Server responded with ${response.status}: ${text}`);
    }
    return response.json();
  }
  