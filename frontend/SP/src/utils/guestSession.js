import AsyncStorage from "@react-native-async-storage/async-storage";

const GUEST_SESSION_KEY = "guest_session_id";
const GUEST_LIBRARY_CACHE = "guest_library_cache_json";

function randomHexSessionId() {
  const arr = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < arr.length; i += 1) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function ensureGuestSessionId() {
  const existing = await AsyncStorage.getItem(GUEST_SESSION_KEY);
  if (existing && /^[a-f0-9]{32}$/.test(existing)) {
    return existing;
  }
  const id = randomHexSessionId();
  await AsyncStorage.setItem(GUEST_SESSION_KEY, id);
  return id;
}

export async function appendGuestLibraryCache(row) {
  if (!row || row.id == null) return;
  const raw = await AsyncStorage.getItem(GUEST_LIBRARY_CACHE);
  let arr = [];
  try {
    arr = raw ? JSON.parse(raw) : [];
  } catch {
    arr = [];
  }
  if (!Array.isArray(arr)) arr = [];
  const next = [row, ...arr.filter((x) => x?.id !== row.id)].slice(0, 50);
  await AsyncStorage.setItem(GUEST_LIBRARY_CACHE, JSON.stringify(next));
}

export async function getGuestLibraryCache() {
  const raw = await AsyncStorage.getItem(GUEST_LIBRARY_CACHE);
  try {
    const a = raw ? JSON.parse(raw) : [];
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

export function mergeGuestPhotoLists(apiItems, cachedItems) {
  const byId = new Map();
  for (const r of apiItems || []) {
    if (r?.id != null) byId.set(r.id, r);
  }
  for (const r of cachedItems || []) {
    if (r?.id != null && !byId.has(r.id)) byId.set(r.id, r);
  }
  return Array.from(byId.values()).sort((a, b) => {
    const ta = new Date(a.created_at || 0).getTime();
    const tb = new Date(b.created_at || 0).getTime();
    return tb - ta;
  });
}
