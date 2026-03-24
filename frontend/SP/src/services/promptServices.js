import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { getBearerAuthHeader, getJsonAuthHeaders } from "../utils/apiAuth";

export async function getPromptSelection() {
  const headers = await getBearerAuthHeader();
  const response = await fetch(`${API_BASE_URL}/api/prompts`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }

  return response.json();
}

async function authHeaders() {
  return getJsonAuthHeaders();
}

export async function updatePromptSelection(id, body) {
  const headers = await authHeaders();
  const res = await axios.patch(`${API_BASE_URL}/api/prompts/${encodeURIComponent(id)}`, body, {
    headers,
  });
  return res.data.prompt;
}

export async function createPromptSelection(body) {
  const headers = await authHeaders();
  const res = await axios.post(`${API_BASE_URL}/api/prompts`, body, { headers });
  return res.data.prompt;
}
