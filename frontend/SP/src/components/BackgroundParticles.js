import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

const DEFAULT_DOT = "rgba(124,58,237,0.3)";
/** Softer dots on light backgrounds (e.g. library sky blue). */
export const BACKGROUND_PARTICLES_SOFT_DOT = "rgba(124,58,237,0.22)";

/**
 * Full-screen decorative particle field. Safe to stack behind content (`pointerEvents="none"`).
 */
export default function BackgroundParticles({
  width,
  height,
  count = 20,
  spreadX = 137,
  spreadY = 97,
  dotSize = 4,
  dotColor = DEFAULT_DOT,
  zIndex = 0,
}) {
  const { width: w, height: h } = Dimensions.get("window");
  const W = width ?? w;
  const H = height ?? h;

  return (
    <View style={[styles.container, { zIndex }]} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              left: (i * spreadX) % W,
              top: (i * spreadY) % H,
              backgroundColor: dotColor,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  dot: {
    position: "absolute",
  },
});
