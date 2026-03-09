import React from "react";
import { View, Text, TouchableOpacity, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commonStyles, colors } from "../styles/commonStyles";
import { sendPhotoToGenerate } from "../services/photoServices";

export default function PromptSelectionScreen({ route, navigation }) {
  const { imageUrl } = route.params || {};

  async function handleGenerate () {
    const prompt = `
  Use the reference image as the base composition.

  Preserve:
  - subject pose
  - camera angle
  - general lighting

  Modify:
  - change background to a Sancuary of Truth in Pattaya, Thailand
`;
    await sendPhotoToGenerate(imageUrl,prompt).catch((error) => {
      console.log(error);
      Alert.alert("Error", error.message || "Failed to generate image.");
    });
    
    navigation.replace("Library");
  };

  return (
    <View style={commonStyles.libraryScreen}>
      <View style={commonStyles.libraryHeader}>
        <TouchableOpacity onPress={() => navigation.replace("Home")}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={commonStyles.libraryHeaderTitle}>Generate Background</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={commonStyles.homeContent}>
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={[commonStyles.preview, { width: 250, height: 250 }]} 
            resizeMode="cover"
          />
        ) : null}

        <Text style={[commonStyles.title, { marginTop: 30, textAlign: "center" }]}>
          Ready to transform?
        </Text>

        <TouchableOpacity
          style={[commonStyles.button, { width: "80%", marginTop: 20 }]}
          onPress={handleGenerate}
        >
          <Text style={commonStyles.buttonText}>Generate Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
