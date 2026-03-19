import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { Alert } from "react-native";

export const handleLogin = async ({ email, password, navigation }) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
    console.log("Login response:", res.data);
    await AsyncStorage.setItem("token", res.data.token);
    navigation.replace("Home");
  } catch (err) {
    const data = err.response?.data;
    const message =
      data?.message ||
      (data?.errors?.length ? data.errors.map((e) => e.msg).join("\n") : null) ||
      err.message ||
      "Something went wrong";
    Alert.alert("Login Failed", message);
  }
};