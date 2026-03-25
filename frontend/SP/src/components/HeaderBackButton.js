import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { promptStyles } from "../styles/promptStyles";
import { ui } from "../theme/ui";

export default function HeaderBackButton({
  onPress,
  style,
  accessibilityLabel = "Go back",
  iconSize = 20,
}) {
  return (
    <TouchableOpacity
      style={[promptStyles.promptBackBtn, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name="arrow-back" size={iconSize} color={ui.colors.muted} />
    </TouchableOpacity>
  );
}
