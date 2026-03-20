import { StyleSheet } from "react-native";
import { ui } from "../theme/ui";
import { centerContent, glassBorder, textBold, textMuted } from "./bases";

export const authStyles = StyleSheet.create({
  authScreen: {
    flex: 1,
    backgroundColor: ui.colors.background,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: "center",
  },
  authForm: {
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
    gap: 24,
  },
  authTitle: { ...textBold, fontSize: 22, textAlign: "center" },
  authField: {
    gap: 8,
  },
  authLabel: { ...textMuted, fontWeight: "500" },
  authInput: {
    ...glassBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: ui.colors.glass,
    color: ui.colors.text,
    fontSize: 16,
  },
  authPrimaryButton: {
    ...centerContent,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: ui.colors.primary,
    marginTop: 8,
  },
  authPrimaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  authSecondaryButton: {
    ...centerContent,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "transparent",
    ...glassBorder,
    marginTop: 12,
  },
  authSecondaryButtonText: { ...textMuted, fontWeight: "600" },
  authError: {
    color: "#FCA5A5",
    fontSize: 14,
    marginBottom: 8,
  },
});
