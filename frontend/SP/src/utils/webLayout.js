import { Platform } from "react-native";

const WEB_HOME_COMPACT_W = 1680;
const WEB_HOME_COMPACT_H = 900;
const WEB_HOME_SCALE = 0.85;

export function getWebHomeScale(width, height) {
  if (Platform.OS !== "web") return 1;
  const compact = width < WEB_HOME_COMPACT_W || height < WEB_HOME_COMPACT_H;
  return compact ? WEB_HOME_SCALE : 1;
}
