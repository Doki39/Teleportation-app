import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BackgroundParticles from "../components/BackgroundParticles";
import { libraryStyles } from "../styles/libraryStyles";
import { promptStyles } from "../styles/promptStyles";
import { ui } from "../theme/ui";
import { goBackOrHome } from "../utils/navigationHelpers";

export default function SettingsScreen({ navigation }) {
  const { width, height } = useWindowDimensions();

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
          <Text style={promptStyles.promptHeaderTitle}>Settings</Text>
          <Text style={promptStyles.promptHeaderSubtitle}>Manage your preferences</Text>
        </View>
        <View style={promptStyles.promptBackBtn}>
          <Ionicons name="settings" size={20} color={ui.colors.primary} />
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
        <Text style={{ color: ui.colors.muted, fontSize: 15, lineHeight: 22 }}>
          More options coming soon.
        </Text>
      </View>
    </View>
  );
}
