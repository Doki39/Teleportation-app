import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";
import { API_BASE_URL } from "../config/api";

function formatApiValidationErrors(data) {
  const errs = data?.errors;
  if (Array.isArray(errs) && errs.length > 0) {
    const lines = errs.map((e) => e?.msg || e?.message || JSON.stringify(e)).filter(Boolean);
    if (lines.length) return lines.join("\n");
  }
  return data?.message || null;
}

export function isUserAdmin(user) {
  const r = user?.role ?? user?.roles;
  return r === "admin";
}

export async function getStoredUser() {
  const raw = await AsyncStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const handleRegistration = async ({
  first_name,
  last_name,
  email,
  phone_number,
  password,
  confirmPassword,
  navigation,
}) => {
  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }
  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      first_name,
      last_name,
      email,
      phone_number,
      password,
    });

    if (res.data.token && res.data.user) {
      await AsyncStorage.setItem("token", res.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
      navigation.replace("Home");
      return { success: true };
    }
    const failMsg = formatApiValidationErrors(res.data) || "Something went wrong";
    return { success: false, error: failMsg };
  } catch (err) {
    const data = err.response?.data;
    const message =
      formatApiValidationErrors(data) || data?.message || err.message || "Something went wrong";
    return { success: false, error: message };
  }
};

export const handleLogout = async () => {
  await AsyncStorage.multiRemove(["token", "user"]);
};
export async function signOut({ setLoggedIn, navigation } = {}) {
  await handleLogout();
  setLoggedIn?.(false);
  if (navigation) {
    navigation.replace("Home");
  }
}

export const handleLogin = async ({ email, password, navigation }) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
    console.log("Login response:", res.data);
    await AsyncStorage.setItem("token", res.data.token);
    if (res.data.user) {
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
    }
    navigation.replace("Home");
  } catch (err) {
    const data = err.response?.data;
    const message =
      formatApiValidationErrors(data) || data?.message || err.message || "Something went wrong";
    Alert.alert("Login Failed", message);
  }
};