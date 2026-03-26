import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BackgroundParticles from "../components/BackgroundParticles";
import HeaderBackButton from "../components/HeaderBackButton";
import ConnectedProfileMenuButton from "../components/ConnectedProfileMenuButton";
import { libraryStyles } from "../styles/libraryStyles";
import { promptStyles } from "../styles/promptStyles";
import { ui } from "../theme/ui";
import { goBackOrHome } from "../utils/navigationHelpers";
import { useRequireAdmin } from "../hooks/useRequireAdmin";

export default function PromptManagementScreen({ navigation }) {
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

      <ConnectedProfileMenuButton />

      <View style={promptStyles.promptHeader}>
        <HeaderBackButton onPress={() => goBackOrHome(navigation)} />
        <View style={promptStyles.promptHeaderText}>
          <Text style={promptStyles.promptHeaderTitle}>Prompt management</Text>
          <Text style={promptStyles.promptHeaderSubtitle}>Prompt library</Text>
        </View>
        <View style={promptStyles.promptBackBtn} />
      </View>

      <View style={promptStyles.promptMgmtOptions}>
        <View style={promptStyles.promptMgmtBoardOuter}>
        <TouchableOpacity
          style={[promptStyles.promptMgmtOption, promptStyles.promptMgmtOptionCreate]}
          onPress={() => navigation.navigate("PromptCreate")}
          accessibilityRole="button"
          accessibilityLabel="Create new prompt"
        >
          <Ionicons name="add-circle-outline" size={28} color={ui.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={promptStyles.promptMgmtOptionTitle}>Create new prompt</Text>
            <Text style={promptStyles.promptMgmtOptionSubtitle}>Add a new prompt to the library</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={ui.colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[promptStyles.promptMgmtOption, promptStyles.promptMgmtOptionManageExisting]}
          onPress={() => navigation.navigate("ManageExistingPrompts")}
          accessibilityRole="button"
          accessibilityLabel="Manage existing prompts"
        >
          <Ionicons name="create-outline" size={28} color={ui.colors.secondary} />
          <View style={{ flex: 1 }}>
            <Text style={promptStyles.promptMgmtOptionTitle}>Manage existing prompts</Text>
            <Text style={promptStyles.promptMgmtOptionSubtitle}>View and change prompts in the library</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={ui.colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[promptStyles.promptMgmtOption, promptStyles.promptMgmtOptionCreate, { marginTop: 12 }]}
          onPress={() => navigation.navigate("RotationManagement")}
          accessibilityRole="button"
          accessibilityLabel="Rotation management"
        >
          <Ionicons name="images-outline" size={28} color={ui.colors.secondary} />
          <View style={{ flex: 1 }}>
            <Text style={promptStyles.promptMgmtOptionTitle}>Rotation management</Text>
            <Text style={promptStyles.promptMgmtOptionSubtitle}>Home slideshow: pick recent photos and set location</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={ui.colors.muted} />
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
