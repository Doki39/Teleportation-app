import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ui } from "../theme/ui";

const SUPPORT_EMAIL = "support@teleport-app.com";

export default function ContactSupportScreen() {
  const handleEmailPress = async () => {
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Teleport app support")}`;
    const canOpen = await Linking.canOpenURL(mailto);
    if (canOpen) {
      await Linking.openURL(mailto);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="mail-open-outline" size={28} color={ui.colors.secondary} />
        </View>
        <Text style={styles.title}>Contact Support</Text>
        <Text style={styles.body}>
          If you keep seeing generation issues, contact our support team and include your account email plus a short
          description of the problem.
        </Text>
        <Pressable style={styles.emailBtn} onPress={handleEmailPress}>
          <Text style={styles.emailBtnText}>{SUPPORT_EMAIL}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ui.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 24,
    alignItems: "center",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(6,182,212,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    color: ui.colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  body: {
    color: ui.colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 18,
  },
  emailBtn: {
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.45)",
    backgroundColor: "rgba(6,182,212,0.14)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emailBtnText: {
    color: ui.colors.secondary,
    fontSize: 15,
    fontWeight: "700",
  },
});
