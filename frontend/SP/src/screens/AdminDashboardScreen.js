import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BackgroundParticles from "../components/BackgroundParticles";
import HeaderBackButton from "../components/HeaderBackButton";
import ConnectedProfileMenuButton from "../components/ConnectedProfileMenuButton";
import { libraryStyles } from "../styles/libraryStyles";
import { promptStyles } from "../styles/promptStyles";
import { ui } from "../theme/ui";
import { goBackOrHome } from "../utils/navigationHelpers";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { patchUserBonusGenerations } from "../services/adminServices";

const DEFAULT_CAP = 3;

const adminDashboardStyles = StyleSheet.create({
  boardCard: {
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: "stretch",
  },
});

export default function AdminDashboardScreen({ navigation }) {
  const allowed = useRequireAdmin(navigation);
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [bonusGenerations, setBonusGenerations] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!allowed) {
    return (
      <View style={[libraryStyles.libraryScreen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={ui.colors.primary} />
      </View>
    );
  }

  const onSubmitBonus = async () => {
    setFeedback(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setFeedback({ type: "error", text: "Enter a user email." });
      return;
    }
    const n = Number.parseInt(String(bonusGenerations).trim(), 10);
    if (Number.isNaN(n) || n < 0 || n > 9999) {
      setFeedback({ type: "error", text: "Bonus must be a number from 0 to 9999." });
      return;
    }

    setSaving(true);
    try {
      const data = await patchUserBonusGenerations(trimmed, n);
      const eff = data?.effectiveLimit ?? DEFAULT_CAP + n;
      setFeedback({
        type: "ok",
        text: `Updated ${data?.user?.email ?? trimmed}: bonus ${data?.user?.bonus_generations ?? n}, total allowed generations ${eff} (${DEFAULT_CAP} default + bonus).`,
      });
    } catch (e) {
      setFeedback({ type: "error", text: e.message || "Request failed." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={libraryStyles.libraryScreen}>
      <BackgroundParticles width={width} height={height} />

      <ConnectedProfileMenuButton />

      <View style={promptStyles.promptHeader}>
        <HeaderBackButton onPress={() => goBackOrHome(navigation)} />
        <View style={promptStyles.promptHeaderText}>
          <Text style={promptStyles.promptHeaderTitle}>Admin</Text>
          <Text style={promptStyles.promptHeaderSubtitle}>User quotas & prompts</Text>
        </View>
        <View style={promptStyles.promptBackBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          style={promptStyles.promptMgmtListScroll}
          contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[promptStyles.promptMgmtBoardOuter, adminDashboardStyles.boardCard]}>
            <Text style={[promptStyles.promptMgmtModalTitle, { marginBottom: 8 }]}>Bonus generations</Text>
            <Text style={[promptStyles.promptMgmtModalMessage, { marginBottom: 16 }]}>
              Set extra generations on top of the default {DEFAULT_CAP} per user. Example: bonus 2 → 5 total allowed.
            </Text>

            <Text style={promptStyles.promptMgmtLabel}>User email</Text>
            <TextInput
              style={promptStyles.promptMgmtInput}
              value={email}
              onChangeText={setEmail}
              placeholder="user@example.com"
              placeholderTextColor={ui.colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            <Text style={promptStyles.promptMgmtLabel}>Bonus generations</Text>
            <TextInput
              style={promptStyles.promptMgmtInput}
              value={bonusGenerations}
              onChangeText={setBonusGenerations}
              placeholder="0"
              placeholderTextColor={ui.colors.muted}
              keyboardType="number-pad"
            />

            {feedback && (
              <Text
                style={[
                  promptStyles.promptMgmtModalMessage,
                  { marginTop: 12, color: feedback.type === "ok" ? ui.colors.secondary : "#f87171" },
                ]}
              >
                {feedback.text}
              </Text>
            )}

            <TouchableOpacity
              style={[promptStyles.promptMgmtChangeImageBtn, { marginTop: 16, opacity: saving ? 0.7 : 1 }]}
              onPress={onSubmitBonus}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Save bonus generations"
            >
              {saving ? (
                <ActivityIndicator color={ui.colors.primary} />
              ) : (
                <>
                  <Ionicons name="save-outline" size={22} color={ui.colors.primary} />
                  <Text style={[promptStyles.promptMgmtModalBtnText, { color: ui.colors.text }]}>Save</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[promptStyles.promptMgmtOption, promptStyles.promptMgmtOptionCreate, { marginTop: 24 }]}
              onPress={() => navigation.navigate("PromptManagement")}
              accessibilityRole="button"
              accessibilityLabel="Open prompt management"
            >
              <Ionicons name="construct-outline" size={28} color={ui.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={promptStyles.promptMgmtOptionTitle}>Prompt management</Text>
                <Text style={promptStyles.promptMgmtOptionSubtitle}>Create and edit teleport prompts</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={ui.colors.muted} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
