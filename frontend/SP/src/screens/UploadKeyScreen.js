import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commonStyles } from "../styles/commonStyles";
import { openLibrary, openCamera } from "../utils/photoUtils";
import { uploadKeyPhoto } from "../services/photoServices";
import { saveDetails } from "../services/savingServices";

export default function KeyScreen({ navigation, route }) {
  const { data } = route.params ?? {};

  const handleKeyPhoto = async (getPayload) => {
    if (!data) {
      Alert.alert("Error", "Missing car details.");
      return;
    }
    try {
      const payload = await getPayload();
      if (!payload) return;

      const keyImageUrl = await uploadKeyPhoto(payload);
      const url =
        typeof keyImageUrl === "string" ? keyImageUrl : keyImageUrl?.keyImageUrl ?? null;
      if (!url) {
        Alert.alert("Error", "No key image URL returned.");
        return;
      }

      await saveDetails({ ...data, keyImageUrl: url });
      navigation.replace("Library");
    } catch (err) {
      console.log(err);
      Alert.alert(
        "Error",
        err.message || "Upload or save failed"
      );
    }
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.homeContent}>
        <Text style={{ marginBottom: 8, fontSize: 16 }}>
          Take a photo of the car key
        </Text>
        <TouchableOpacity
          style={commonStyles.cameraButton}
          onPress={() => handleKeyPhoto(openCamera)}
        >
          <Ionicons name="camera" size={50} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={commonStyles.button}
          onPress={() => handleKeyPhoto(openLibrary)}
        >
          <Text style={commonStyles.authText}>Upload from library</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
