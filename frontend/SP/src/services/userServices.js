import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

async function authConfig() {
  const token = await AsyncStorage.getItem("token");
  if (!token) {
    const err = new Error("Not logged in");
    err.code = "NO_TOKEN";
    throw err;
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
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

export function formatApiError(err) {
  const data = err.response?.data;
  if (data?.errors?.length) {
    return data.errors.map((e) => e.msg || e.message).join("\n");
  }
  if (data?.message) return data.message;
  return err.message || "Something went wrong";
}
