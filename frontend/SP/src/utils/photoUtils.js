import * as ImagePicker from "expo-image-picker";
import { Platform, Alert } from "react-native";
import { uploadPhotoToDrive } from "../services/photoServices";

export async function handlePhotoFlow(getPayload, navigation) {
  try {
    const payload = await getPayload();
    if (!payload) return;

    await uploadPhotoToDrive(payload);

    let imageUri = payload.uri ?? null;
    if (payload.file && typeof URL !== "undefined" && URL.createObjectURL) {
      imageUri = URL.createObjectURL(payload.file);
    }

    navigation.replace("Library", {
    });
  } catch (err) {
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

  