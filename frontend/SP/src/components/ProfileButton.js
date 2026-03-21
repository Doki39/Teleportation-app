import React, { useMemo, useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { profileStyles } from "../styles/profileStyles";
import { platformShadow, USE_NATIVE_DRIVER } from "../utils/platformStyles";

export default function ProfileButton({ onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const hovered = useRef(false);

  const animateTo = (toScale, toGlow) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: toScale,
        useNativeDriver: USE_NATIVE_DRIVER,
        friction: 6,
        tension: 170,
      }),
      Animated.timing(glow, {
        toValue: toGlow,
        duration: 180,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  };

  const shadowStyle = useMemo(
    () =>
      platformShadow({
        shadowColor: "#54F4FF",
        shadowOpacity: 0.75,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 0 },
      }),
    []
  );

  return (
    <Animated.View style={[profileStyles.profileWrap, shadowStyle, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onHoverIn={() => {
          hovered.current = true;
          animateTo(1.12, 1);
        }}
        onHoverOut={() => {
          hovered.current = false;
          animateTo(1, 0);
        }}
        onPressIn={() => animateTo(0.96, 1)}
        onPressOut={() => animateTo(hovered.current ? 1.12 : 1, hovered.current ? 1 : 0)}
        style={({ pressed }) => [profileStyles.profileButton, pressed && { opacity: 0.95 }]}
      >
        <Animated.View style={[profileStyles.profileGlow, { opacity: glow, pointerEvents: "none" }]} />
        <View style={profileStyles.profileCore}>
          <Ionicons name="person" size={18} color="#9AFBFF" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

