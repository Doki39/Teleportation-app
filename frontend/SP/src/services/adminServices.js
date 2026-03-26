import { API_BASE_URL } from "../config/api";
import { getJsonAuthHeaders } from "../utils/apiAuth";
import { throwFromFailedResponse } from "../utils/apiError";

export async function getPhotoRotationList() {
  const headers = await getJsonAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/admin/photo-rotation`, {
    method: "GET",
    headers,
  });
  const text = await response.text();
  if (!response.ok) {
    throwFromFailedResponse(response.status, text);
  }
  return text ? JSON.parse(text) : [];
}

export async function deletePhotoRotation(id) {
  const headers = await getJsonAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/admin/photo-rotation/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
  });
  if (response.status === 204) return;
  const text = await response.text();
  if (!response.ok) {
    throwFromFailedResponse(response.status, text);
  }
}

export async function postPhotoRotation({ imageUrl, location }) {
  const headers = await getJsonAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/admin/photo-rotation`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      imageUrl: String(imageUrl).trim(),
      location: String(location).trim(),
    }),
  });
  const text = await response.text();
  if (!response.ok) {
    throwFromFailedResponse(response.status, text);
  }
  return text ? JSON.parse(text) : null;
}

export async function patchUserBonusGenerations(email, bonusGenerations) {
  const headers = await getJsonAuthHeaders();
  const n = Number.parseInt(String(bonusGenerations), 10);
  const response = await fetch(`${API_BASE_URL}/api/admin/users/bonus-generations`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      email: String(email).trim(),
      bonusGenerations: Number.isFinite(n) ? n : 0,
    }),
  });
  const text = await response.text();
  if (!response.ok) {
    throwFromFailedResponse(response.status, text);
  }
  return text ? JSON.parse(text) : null;
}
