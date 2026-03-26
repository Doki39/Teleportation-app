import { Platform } from "react-native";

const WEB_HOME_COMPACT_W = 1680;
const WEB_HOME_COMPACT_H = 900;
const WEB_HOME_MIN_SCALE = 0.72;
const WEB_LAPTOP_MAX_W = 1600;
const WEB_LAPTOP_MAX_H = 1000;
const WEB_DYNAMIC_MIN_W = 1024;
const WEB_DYNAMIC_MAX_W = 1680;
const WEB_PHONE_MAX_SHORT_EDGE = 600;

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function interpolateScale(width, minScale) {
  if (Platform.OS !== "web") return 1;
  if (width >= WEB_DYNAMIC_MAX_W) return 1;
  const t = clamp01((width - WEB_DYNAMIC_MIN_W) / (WEB_DYNAMIC_MAX_W - WEB_DYNAMIC_MIN_W));
  return minScale + (1 - minScale) * t;
}

export function getWebHomeScale(width, height) {
  if (Platform.OS !== "web") return 1;
  if (Math.min(width, height) < WEB_PHONE_MAX_SHORT_EDGE) return 1;
  const compact = width < WEB_HOME_COMPACT_W || height < WEB_HOME_COMPACT_H;
  if (!compact) return 1;

  const widthRatio = width / WEB_HOME_COMPACT_W;
  const heightRatio = height / WEB_HOME_COMPACT_H;
  const ratio = Math.min(widthRatio, heightRatio);
  return Math.max(WEB_HOME_MIN_SCALE, Math.min(1, ratio));
}

export function isWebLaptopViewport(width, height) {
  if (Platform.OS !== "web") return false;
  if (Math.min(width, height) < WEB_PHONE_MAX_SHORT_EDGE) return false;
  return width <= WEB_LAPTOP_MAX_W && height <= WEB_LAPTOP_MAX_H;
}

export function getWebHomeRocketScale(width, height) {
  if (!isWebLaptopViewport(width, height)) return 1;
  return interpolateScale(width, 0.85);
}

export function getWebHomePortalScale(width, height) {
  if (!isWebLaptopViewport(width, height)) return 1;
  return interpolateScale(width, 0.7);
}

export function getWebCylinderScale(width, height) {
  if (!isWebLaptopViewport(width, height)) return 1;
  const widthScale = interpolateScale(width, 0.6);
  const heightScale = Math.max(0.55, Math.min(1, height / 1000));
  return Math.max(0.55, Math.min(widthScale, heightScale));
}
