import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commonStyles } from "../styles/commonStyles";
import { sendPhotoToGenerate } from "../services/photoServices";
import { getPromptSelection } from "../services/promptServices";
import { API_BASE_URL } from "../config/api";

export default function PromptSelectionScreen({ route, navigation }) {
  const { imageUrl } = route.params || {};

  const [prompts, setPrompts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    async function loadPrompts() {
      try {
        const data = await getPromptSelection();
        setPrompts(data);
      } catch (err) {
        console.log(err);
        Alert.alert("Error", err.message || "Failed to load prompts.");
      }
    }

    loadPrompts();
  }, []);

  async function handleConfirm() {
    if (!selectedId) {
      Alert.alert("Select prompt", "Please select an option first.");
      return;
    }

    const selected = prompts.find((p) => p.id === selectedId);
    if (!selected) {
      Alert.alert("Error", "Selected prompt not found.");
      return;
    }

    try {
      await sendPhotoToGenerate(imageUrl, selected.prompt);
      navigation.replace("Library");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message || "Failed to generate image.");
    }
  }

  return (
    <View style={commonStyles.libraryScreen}>
      <View style={commonStyles.homeContent}>
        <Text style={[commonStyles.title, { marginTop: 20, textAlign: "center" }]}>
          Pick one of the styles
        </Text>

    
        <ScrollView style={{ width: "100%", marginTop: 20 }}>
          {prompts.map((item) => {
            const isSelected = item.id === selectedId;
            const imageUri = item.image_url?.startsWith("http")
              ? item.image_url
              : `${API_BASE_URL}${item.image_url}`;
            const shortTitle =
              item.prompt && item.prompt.length > 40
                ? item.prompt.slice(0, 40) + "..."
                : item.prompt;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedId(item.id)}
                style={{
                  marginHorizontal: 20,
                  marginBottom: 16,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: isSelected ? "#FFD700" : "#ccc",
                  backgroundColor: isSelected ? "#fffbea" : "white",
                  overflow: "hidden",
                }}
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: "100%", height: 150 }}
                    resizeMode="cover"
                  />
                ) : null}
                <View style={{ padding: 12 }}>
                  <Text style={{ fontWeight: "600", fontSize: 16 }}>{shortTitle}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity
          style={[commonStyles.button, { width: "80%", marginTop: 20 }]}
          onPress={handleConfirm}
        >
          <Text style={commonStyles.buttonText}>Confirm & Generate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}