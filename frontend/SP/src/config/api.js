import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? Constants.extra ?? {};

export const API_BASE_URL =
  extra.apiBaseUrl ||
  "http://localhost:3000";

