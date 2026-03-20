import { StyleSheet } from "react-native";
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
});
