import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getBearerAuthHeader() {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Not logged in");
  return { Authorization: `Bearer ${token}` };
}

export async function getJsonAuthHeaders() {
  return {
    ...(await getBearerAuthHeader()),
    "Content-Type": "application/json",
  };
}
