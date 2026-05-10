import React, { useEffect, useState } from "react";
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
  Switch,
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
import { patchUserBonusGenerations, patchGuestHomeFlow } from "../services/adminServices";
import { fetchPublicConfig } from "../services/configServices";

const DEFAULT_CAP = 3;

const adminDashboardStyles = StyleSheet.create({
  boardCard: {
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: "stretch",
  },
  adminPanelCard: {
    flex: 0,
    flexGrow: 0,
    flexShrink: 0,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    overflow: "hidden",
  },
  entryToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 4,
    width: "100%",
    maxWidth: "100%",
  },
  entryToggleLabels: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 8,
    minWidth: 0,
    flexShrink: 1,
  },
  entryToggleLabel: {
    fontSize: 13,
    color: ui.colors.muted,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  entryToggleLabelActive: {
    color: ui.colors.text,
    fontWeight: "600",
  },
  contentCard: {
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: "stretch",
  },
  entryBlock: {
    zIndex: 2,
    width: "100%",
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 10,
    alignItems: "center",
  },
  cardBodyText: {
    width: "100%",
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
  const [guestModeEnabled, setGuestModeEnabled] = useState(false);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    fetchPublicConfig()
      .then((cfg) => {
        if (!cancelled && typeof cfg?.guestHomeFlowEnabled === "boolean") {
          setGuestModeEnabled(cfg.guestHomeFlowEnabled);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [allowed]);

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
        <View style={adminDashboardStyles.entryBlock}>
          <View
            style={[
              promptStyles.promptMgmtBoardOuter,
              adminDashboardStyles.contentCard,
              adminDashboardStyles.boardCard,
              adminDashboardStyles.adminPanelCard,
            ]}
          >
            <Text style={[promptStyles.promptMgmtModalTitle, adminDashboardStyles.cardBodyText, { marginBottom: 8 }]}>
              Home entry mode
            </Text>
            <Text
              style={[promptStyles.promptMgmtModalMessage, adminDashboardStyles.cardBodyText, { marginBottom: 14 }]}
            >
              When Guest is on, anyone can use upload on the home screen without logging in (same for every device).
              Optional env ALLOW_GUEST_HOME_FLOW=true still forces guest API access if you use it for deployment.
            </Text>
            <View style={adminDashboardStyles.entryToggleRow}>
              <View style={adminDashboardStyles.entryToggleLabels}>
                <Text
                  style={[adminDashboardStyles.entryToggleLabel, !guestModeEnabled && adminDashboardStyles.entryToggleLabelActive]}
                  numberOfLines={2}
                >
                  Registration
                </Text>
                <Text
                  style={[adminDashboardStyles.entryToggleLabel, guestModeEnabled && adminDashboardStyles.entryToggleLabelActive]}
                  numberOfLines={2}
                >
                  Guest
                </Text>
              </View>
              <View style={{ flexShrink: 0 }}>
                <Switch
                  value={guestModeEnabled}
                  onValueChange={(v) => {
                    setGuestModeEnabled(v);
                    void patchGuestHomeFlow(v).catch(() => {
                      setGuestModeEnabled(!v);
                    });
                  }}
                  trackColor={{ false: "rgba(148,163,184,0.35)", true: "rgba(124,58,237,0.55)" }}
                  thumbColor={guestModeEnabled ? ui.colors.primary : "#f4f4f5"}
                  ios_backgroundColor="rgba(148,163,184,0.35)"
                  accessibilityRole="switch"
                  accessibilityLabel="Toggle guest mode versus registration mode"
                  accessibilityState={{ checked: guestModeEnabled }}
                />
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          style={promptStyles.promptMgmtListScroll}
          contentContainerStyle={{
            paddingBottom: 32,
            paddingTop: 0,
            flexGrow: 1,
            alignItems: "center",
            width: "100%",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              promptStyles.promptMgmtBoardOuter,
              adminDashboardStyles.contentCard,
              adminDashboardStyles.boardCard,
              adminDashboardStyles.adminPanelCard,
              { marginBottom: 16 },
            ]}
          >
            <Text style={[promptStyles.promptMgmtModalTitle, adminDashboardStyles.cardBodyText, { marginBottom: 8 }]}>
              Bonus generations
            </Text>
            <Text style={[promptStyles.promptMgmtModalMessage, adminDashboardStyles.cardBodyText, { marginBottom: 16 }]}>
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
                  adminDashboardStyles.cardBodyText,
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
