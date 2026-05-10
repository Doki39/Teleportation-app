import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "guest_entry_mode_enabled";

export async function getGuestEntryMode() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw === "true";
  } catch {
    return false;
  }
}

export async function setGuestEntryMode(enabled) {
  await AsyncStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
}
