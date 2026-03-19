import React, { useMemo, useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commonStyles } from "../styles/commonStyles";

export default function ProfileButton({ onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const hovered = useRef(false);

  const animateTo = (toScale, toGlow) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: toScale,
        useNativeDriver: true,
        friction: 6,
        tension: 170,
      }),
      Animated.timing(glow, {
        toValue: toGlow,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const shadowStyle = useMemo(
    () => ({
      shadowColor: "#54F4FF",
      shadowOpacity: 0.75,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 0 },
    }),
    []
  );

  return (
    <Animated.View style={[commonStyles.profileWrap, shadowStyle, { transform: [{ scale }] }]}>
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
        style={({ pressed }) => [commonStyles.profileButton, pressed && { opacity: 0.95 }]}
      >
        <Animated.View pointerEvents="none" style={[commonStyles.profileGlow, { opacity: glow }]} />
        <View style={commonStyles.profileCore}>
          <Ionicons name="person" size={18} color="#9AFBFF" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

