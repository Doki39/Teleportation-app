import { StyleSheet } from "react-native";
import { centerContent } from "./bases";

export const rocketStyles = StyleSheet.create({
  rocketBtnContainer: {
    alignItems: "center",
  },
  rocketPressable: {
    alignItems: "center",
  },
  rocketMain: { ...centerContent, width: 118, height: 118 },
});
