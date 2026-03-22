import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BackgroundParticles from "../components/BackgroundParticles";
import { libraryStyles } from "../styles/libraryStyles";
import { promptStyles } from "../styles/promptStyles";
import { ui } from "../theme/ui";
import { goBackOrHome } from "../utils/navigationHelpers";
import { useRequireAdmin } from "../hooks/useRequireAdmin";

export default function PromptCreateScreen({ navigation }) {
  const allowed = useRequireAdmin(navigation);
  const { width, height } = useWindowDimensions();

  if (!allowed) {
    return (
      <View style={[libraryStyles.libraryScreen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={ui.colors.primary} />
      </View>
    );
  }

  return (
    <View style={libraryStyles.libraryScreen}>
      <BackgroundParticles width={width} height={height} />

      <View style={promptStyles.promptHeader}>
        <TouchableOpacity
          style={promptStyles.promptBackBtn}
          onPress={() => goBackOrHome(navigation)}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={ui.colors.muted} />
        </TouchableOpacity>
        <View style={promptStyles.promptHeaderText}>
          <Text style={promptStyles.promptHeaderTitle}>Create prompt</Text>
          <Text style={promptStyles.promptHeaderSubtitle}>Placeholder</Text>
        </View>
        <View style={promptStyles.promptBackBtn} />
      </View>

      <View style={[promptStyles.promptMgmtContentBoard, promptStyles.promptMgmtContentBoardCreate]}>
        <Text style={{ color: ui.colors.muted, fontSize: 15, lineHeight: 22 }}>
          Create flow will be implemented later.
        </Text>
      </View>
    </View>
  );
}
