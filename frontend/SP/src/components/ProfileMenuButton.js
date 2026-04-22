import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { profileStyles } from "../styles/profileStyles";
import { ui } from "../theme/ui";
import { platformShadow, USE_NATIVE_DRIVER } from "../utils/platformStyles";

function ProfileAvatarTrigger({ onPress, inline }) {
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
    <Animated.View
      style={[
        inline ? profileStyles.profileWrapInline : profileStyles.profileWrap,
        shadowStyle,
        { transform: [{ scale }] },
      ]}
    >
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
        accessibilityRole="button"
        accessibilityLabel="Open profile menu"
      >
        <Animated.View style={[profileStyles.profileGlow, { opacity: glow, pointerEvents: "none" }]} />
        <View style={profileStyles.profileCore}>
          <Ionicons name="person" size={18} color="#9AFBFF" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ProfileMenuButton({ onLogout, showLogout = true, headerLayout = false }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const handleSettings = () => {
    close();
    navigation.navigate("Settings");
  };

  const handleLogout = async () => {
    close();
    await onLogout?.();
  };

  const menuAnchorStyle = headerLayout
    ? [profileStyles.profileMenuAnchor, { top: insets.top + 58, right: 24 }]
    : profileStyles.profileMenuAnchor;

  return (
    <>
      <ProfileAvatarTrigger inline={headerLayout} onPress={() => setOpen(true)} />

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={profileStyles.profileMenuRoot}>
          <Pressable style={profileStyles.profileMenuBackdrop} onPress={close} accessibilityLabel="Close menu" />
          <View style={[menuAnchorStyle, { pointerEvents: "box-none" }]}>
            <View style={profileStyles.profileMenuCard} accessibilityRole="menu">
              <Pressable
                style={({ pressed }) => [profileStyles.profileMenuRow, pressed && { opacity: 0.85 }]}
                onPress={handleSettings}
                accessibilityRole="menuitem"
              >
                <Ionicons name="settings-outline" size={20} color={ui.colors.primary} />
                <Text style={profileStyles.profileMenuLabel}>Settings</Text>
              </Pressable>
              {showLogout && (
                <>
                  <View style={profileStyles.profileMenuDivider} />
                  <Pressable
                    style={({ pressed }) => [profileStyles.profileMenuRow, pressed && { opacity: 0.85 }]}
                    onPress={handleLogout}
                    accessibilityRole="menuitem"
                  >
                    <Ionicons name="log-out-outline" size={20} color="#FCA5A5" />
                    <Text style={[profileStyles.profileMenuLabel, profileStyles.profileMenuLabelDanger]}>Log out</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
