import { Platform, Alert, Linking } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import Constants from "expo-constants";

const isExpoGo = Constants.appOwnership === "expo";

function safeFilename(filename) {
  return filename.replace(/[^a-z0-9._-]+/gi, "_") || "image.jpg";
}

async function openShareSheet(fileUri, dialogTitle = "Share image") {
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "image/jpeg",
      dialogTitle,
    });
  } else {
    Alert.alert("Share unavailable", "Sharing is not available on this device.");
  }
}

async function downloadRemoteToCache(remoteUrl, filename) {
  const safeName = safeFilename(filename);
  const base = FileSystem.cacheDirectory;
  if (!base) throw new Error("No cache directory available.");
  const dest = `${base}${safeName}`;
  const result = await FileSystem.downloadAsync(remoteUrl, dest);
  return result.uri;
}

async function webDownloadBlob(remoteUrl, safeName) {
  try {
    const res = await fetch(remoteUrl, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.blob();
  } catch {
    window.open(remoteUrl, "_blank", "noopener,noreferrer");
    return null;
  }
}

function triggerWebFileDownload(blob, safeName) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = safeName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

const ANDROID_SAVE_GRANULAR = [];

async function saveFileToDeviceGallery(localUri) {
  try {
    if (Platform.OS === "android") {
      const { status: existing } = await MediaLibrary.getPermissionsAsync(
        true,
        ANDROID_SAVE_GRANULAR
      );
      let permission = existing;
      if (existing !== "granted") {
        const { status: requested } = await MediaLibrary.requestPermissionsAsync(
          true,
          ANDROID_SAVE_GRANULAR
        );
        permission = requested;
      }
      if (permission !== "granted") {
        return { ok: false, denied: true };
      }
    } else {
      const { status: existing } = await MediaLibrary.getPermissionsAsync(true);
      let permission = existing;
      if (existing !== "granted") {
        const { status: requested } = await MediaLibrary.requestPermissionsAsync(true);
        permission = requested;
      }
      if (permission !== "granted") {
        return { ok: false, denied: true };
      }
    }

    await MediaLibrary.createAssetAsync(localUri);
    return { ok: true };
  } catch (e) {
    console.warn("Gallery save failed:", e?.message ?? e);
    return { ok: false, unavailable: true };
  }
}

export async function saveRemoteImage(remoteUrl, filename = `teleport-${Date.now()}.jpg`) {
  const safeName = safeFilename(filename);

  if (Platform.OS === "web") {
    const blob = await webDownloadBlob(remoteUrl, safeName);
    if (blob) triggerWebFileDownload(blob, safeName);
    return;
  }

  let uri;
  try {
    uri = await downloadRemoteToCache(remoteUrl, filename);
  } catch (e) {
    Alert.alert("Download failed", e.message || "Could not download this image.");
    return;
  }

  const result = await saveFileToDeviceGallery(uri);

  if (result.ok) {
    Alert.alert("Saved", "Photo saved to your gallery.");
    return;
  }

  if (result.denied) {
    Alert.alert(
      "Gallery access needed",
      "Allow photo / media access for this app so images can be saved to your gallery.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Settings", onPress: () => Linking.openSettings() },
      ]
    );
    return;
  }

  const body =
    isExpoGo && Platform.OS === "android"
      ? "Saving directly to the gallery isn’t supported in Expo Go on this Android version. Create a development build to use gallery saves, or share the image and save it from there."
      : "Couldn’t save to the gallery. Try sharing the image instead.";

  Alert.alert("Couldn’t save to gallery", body, [
    { text: "OK" },
    { text: "Share…", onPress: () => openShareSheet(uri, "Save image") },
  ]);
}

export async function shareRemoteImage(remoteUrl, filename = `teleport-${Date.now()}.jpg`) {
  const safeName = safeFilename(filename);

  if (Platform.OS === "web") {
    const blob = await webDownloadBlob(remoteUrl, safeName);
    if (!blob) return;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const file = new File([blob], safeName, { type: blob.type || "image/jpeg" });
        const canShareFiles = !navigator.canShare || navigator.canShare({ files: [file] });
        if (canShareFiles) {
          await navigator.share({ files: [file], title: safeName });
          return;
        }
      } catch (e) {
        if (e.name === "AbortError") return;
        console.warn("navigator.share failed:", e);
      }
    }

    triggerWebFileDownload(blob, safeName);
    return;
  }

  try {
    const uri = await downloadRemoteToCache(remoteUrl, filename);
    await openShareSheet(uri, "Share image");
  } catch (e) {
    Alert.alert("Share failed", e.message || "Could not prepare this image to share.");
  }
}
