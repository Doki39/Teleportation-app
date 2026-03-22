import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export async function getPromptSelection() {
  const response = await fetch(`${API_BASE_URL}/api/prompts`, {
    method: "GET",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }

  return response.json();
}

async function authHeaders() {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Not logged in");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
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
