import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { formatApiResponseBody, formatAxiosError } from "../utils/apiErrors";

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
  const phoneDigits = String(phone_number ?? "").replace(/\D/g, "");
  if (phoneDigits.length < 8) {
    return { success: false, error: "Phone number must contain at least 8 digits" };
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
    const failMsg = formatApiResponseBody(res.data) || "Something went wrong";
    return { success: false, error: failMsg };
  } catch (err) {
    return { success: false, error: formatAxiosError(err) };
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
    await AsyncStorage.setItem("token", res.data.token);
    if (res.data.user) {
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
    }
    navigation.replace("Home");
    return { success: true };
  } catch (err) {
    return { success: false, error: formatAxiosError(err) };
  }
};