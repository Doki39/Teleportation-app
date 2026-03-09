import Constants from "expo-constants";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  Constants.extra?.apiBaseUrl ||
  "http://localhost:3000";

