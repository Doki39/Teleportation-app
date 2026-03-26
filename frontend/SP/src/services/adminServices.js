import { API_BASE_URL } from "../config/api";
import { getJsonAuthHeaders } from "../utils/apiAuth";
import { throwFromFailedResponse } from "../utils/apiError";

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
