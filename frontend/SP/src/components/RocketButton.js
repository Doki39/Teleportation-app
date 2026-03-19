import React, { useEffect, useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commonStyles } from "../styles/commonStyles";

export default function RocketButton({ onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressY = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const hovered = useRef(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -8, duration: 1100, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
  }, [floatY]);

  const animateTo = (toScale, toY) => {
    Animated.parallel([
      Animated.spring(scale, { toValue: toScale, useNativeDriver: true, friction: 6, tension: 170 }),
      Animated.spring(pressY, { toValue: toY, useNativeDriver: true, friction: 7, tension: 180 }),
    ]).start();
  };

  return (
    <Animated.View style={[commonStyles.rocketBtnContainer, { transform: [{ scale }, { translateY: pressY }] }]}>
      <Pressable
        onPress={onPress}
        onHoverIn={() => {
          hovered.current = true;
          animateTo(1.08, -6);
        }}
        onHoverOut={() => {
          hovered.current = false;
          animateTo(1, 0);
        }}
        onPressIn={() => animateTo(0.96, -2)}
        onPressOut={() => {
          animateTo(hovered.current ? 1.08 : 1, hovered.current ? -6 : 0);
        }}
        style={commonStyles.rocketPressable}
      >
        <View style={commonStyles.rocketMain}>
          <Animated.View style={{ transform: [{ translateY: floatY }] }}>
            <Ionicons name="rocket" size={42} color="#9AFBFF" style={{ transform: [{ rotate: "-45deg" }] }} />
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

