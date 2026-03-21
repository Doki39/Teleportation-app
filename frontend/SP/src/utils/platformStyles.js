import { Platform } from "react-native";

export const IS_WEB = Platform.OS === "web";

export const USE_NATIVE_DRIVER = !IS_WEB;

function shadowColorToRgba(color, opacity) {
  if (color == null) return `rgba(0,0,0,${opacity})`;
  const c = String(color);
  if (c.startsWith("rgba(")) return c;
  if (c.startsWith("rgb(") && !c.startsWith("rgba(")) {
    return c.replace("rgb(", "rgba(").replace(")", `, ${opacity})`);
  }
  if (c.startsWith("#")) {
    const hex = c.slice(1);
    const full = hex.length === 3 ? hex.split("").map((x) => x + x).join("") : hex;
    const n = parseInt(full, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${opacity})`;
  }
  return `rgba(0,0,0,${opacity})`;
}

export function platformShadow(native) {
  if (!IS_WEB) return native;
  const { shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation, ...rest } = native;
  const ox = shadowOffset?.width ?? 0;
  const oy = shadowOffset?.height ?? 0;
  const r = shadowRadius ?? 0;
  const rgba = shadowColorToRgba(shadowColor, shadowOpacity ?? 1);
  return {
    ...rest,
    boxShadow: `${ox}px ${oy}px ${r}px ${rgba}`,
  };
}

export function platformTextShadow(native) {
  if (!IS_WEB) return native;
  const { textShadowColor, textShadowOffset, textShadowRadius, ...rest } = native;
  const ox = textShadowOffset?.width ?? 0;
  const oy = textShadowOffset?.height ?? 0;
  const r = textShadowRadius ?? 0;
  const color = textShadowColor ?? "#000";
  return {
    ...rest,
    textShadow: `${ox}px ${oy}px ${r}px ${color}`,
  };
}
