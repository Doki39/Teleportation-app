import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { getJsonAuthHeaders } from "../utils/apiAuth";

async function authConfig() {
  try {
    return { headers: await getJsonAuthHeaders() };
  } catch {
    const err = new Error("Not logged in");
    err.code = "NO_TOKEN";
    throw err;
  }
}

export async function fetchCurrentUser() {
  const config = await authConfig();
  const res = await axios.get(`${API_BASE_URL}/api/users/me`, config);
  return res.data.user;
}

export async function updateCurrentUser(body) {
  const config = await authConfig();
  const res = await axios.patch(`${API_BASE_URL}/api/users/me`, body, config);
  const user = res.data.user;
  await AsyncStorage.setItem("user", JSON.stringify(user));
  return user;
}

export async function deleteCurrentUser(password) {
  const config = await authConfig();
  await axios.delete(`${API_BASE_URL}/api/users/me`, {
    ...config,
    data: { password },
  });
}
