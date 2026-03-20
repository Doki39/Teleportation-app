import { StyleSheet } from "react-native";
import { ui } from "../theme/ui";
import { centerContent, textBold, textMuted } from "./bases";

export const libraryStyles = StyleSheet.create({
  libraryScreen: {
    flex: 1,
    backgroundColor: ui.colors.background,
  },
  libraryListContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  libraryRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  libraryTile: {
    borderRadius: 14,
    overflow: "hidden",
    padding: 3,
    backgroundColor: "rgba(5,11,26,0.75)",
    borderWidth: 2,
    borderColor: "rgba(124,58,237,0.55)",
    borderTopColor: "rgba(124,58,237,0.65)",
    borderLeftColor: "rgba(124,58,237,0.65)",
    borderRightColor: "rgba(6,182,212,0.35)",
    borderBottomColor: "rgba(6,182,212,0.35)",
  },
  libraryTileImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  libraryEmptyWrap: {
    ...centerContent,
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  libraryEmptyTitle: {
    ...textBold,
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  libraryEmptySubtitle: {
    ...textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  libraryLoadingWrap: {
    ...centerContent,
    paddingVertical: 48,
  },
  libraryLoadingText: {
    ...textMuted,
    marginTop: 12,
  },
});
