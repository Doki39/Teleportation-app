import React, { useMemo } from "react";
import { Image, Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ASPECT = 1.35;
const SIZE_SCALE = 1.3;

export default function SouProgramHeaderLogo({ inline = false }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const { logoW, logoH } = useMemo(() => {
    const compact = width < 400;
    const maxW = compact ? Math.min(width * 0.48, 168) : Math.min(width * 0.22, 240);
    const maxH = compact ? 38 : width < 900 ? 46 : 54;
    const wByH = maxH * ASPECT;
    const hByW = maxW / ASPECT;
    let logoW0;
    let logoH0;
    if (wByH <= maxW) {
      logoW0 = wByH;
      logoH0 = maxH;
    } else {
      logoW0 = maxW;
      logoH0 = hByW;
    }
    return { logoW: logoW0 * SIZE_SCALE, logoH: logoH0 * SIZE_SCALE };
  }, [width]);

  const image = (
    <Image
      source={require("../../assets/images/logo.png")}
      style={{ width: logoW, height: logoH }}
      resizeMode="contain"
      accessibilityLabel="ŠOU Program"
    />
  );

  if (inline) {
    return (
      <View style={{ width: logoW, height: logoH }} pointerEvents="none">
        {image}
      </View>
    );
  }

  const topPad = Platform.OS === "web" ? 10 : 6;
  const top = Math.max(insets.top, Platform.OS === "ios" ? 8 : 4) + topPad;
  const left = Math.max(insets.left, 14);

  return (
    <View style={[styles.wrap, { top, left, width: logoW, height: logoH }]} pointerEvents="none">
      {image}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    zIndex: 60,
  },
});
