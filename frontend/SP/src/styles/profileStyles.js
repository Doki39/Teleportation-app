import { StyleSheet } from "react-native";
import { platformShadow } from "../utils/platformStyles";
import { centerContent, iconButtonBase } from "./bases";

export const profileStyles = StyleSheet.create({
  profileWrap: {
    position: "absolute",
    top: 24,
    right: 24,
    zIndex: 50,
    borderRadius: 999,
  },
  profileButton: {
    ...iconButtonBase,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(153,255,255,0.3)",
    overflow: "hidden",
  },
  profileGlow: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 999,
    backgroundColor: "rgba(84,244,255,0.2)",
  },
  profileCore: {
    ...centerContent,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(6,16,24,0.65)",
  },
  profileMenuRoot: {
    flex: 1,
  },
  profileMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,11,26,0.55)",
  },
  profileMenuAnchor: {
    position: "absolute",
    top: 64,
    right: 24,
    minWidth: 208,
  },
  profileMenuCard: {
    backgroundColor: "rgba(12,14,28,0.96)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
    borderRadius: 14,
    overflow: "hidden",
    ...platformShadow({
      shadowColor: "#000",
      shadowOpacity: 0.35,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 12,
    }),
  },
  profileMenuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  profileMenuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  profileMenuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E8EEF5",
  },
  profileMenuLabelDanger: {
    color: "#FCA5A5",
  },
});
