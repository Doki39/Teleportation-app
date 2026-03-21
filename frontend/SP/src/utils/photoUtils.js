import * as ImagePicker from "expo-image-picker";
import { Platform, Alert } from "react-native";
import { uploadPhotoToDrive } from "../services/photoServices";
import { API_BASE_URL } from "../config/api";

export async function handlePhotoFlow(getPayload, navigation, { onUploadStart, onUploadEnd } = {}) {
  try {
    const payload = await getPayload();
    if (!payload) return;

    onUploadStart?.();
    try {
      const { imageUrl } = await uploadPhotoToDrive(payload);
      navigation.replace("PromptSelection", {
        imageUrl,
      });
    } finally {
      onUploadEnd?.();
    }
  } catch (err) {
    onUploadEnd?.();
    console.log(err);
    Alert.alert("Error", err.message);
  }
}

export async function handlePhoto(asset) {
  if(Platform.OS === "web"){
    const response = await fetch(asset.uri)
    const blob = await response.blob()
    return ({file: blob })
  } else {
    return ({uri: asset.uri})
  }
}

export async function openLibrary() {

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      alert("Gallery permission required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 1,
    });
  
    if (!result.canceled) {
      const asset = result.assets[0];
      const payload = await handlePhoto(asset);
      return payload;
    }
  }

export async function openCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      alert("Camera permission required!");
      return;
    }
  
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: false,
    });
  
    if (!result.canceled) {
      const asset = result.assets[0]; 
  
      const payload = await handlePhoto(asset);
      return payload;
  }};

export function buildImageUri(item) {
  if (!item || typeof item !== "object") return null;
  const path =
    item.processed_uri ??
    item.processed_image_uri ??
    item.image_url ??
    item.uri ??
    item.url ??
    item.path;
  if (path == null || path === "") return null;
  const s = String(path).trim();
  if (!s) return null;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const withSlash = s.startsWith("/") ? s : `/${s}`;
  return `${API_BASE_URL}${withSlash}`;
}

  