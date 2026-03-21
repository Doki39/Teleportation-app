import React, { useCallback, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProfileButton from "./ProfileButton";
import { profileStyles } from "../styles/profileStyles";
import { ui } from "../theme/ui";

export default function ProfileMenuButton({ onSettings, onLogout, showLogout = true }) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const handleSettings = () => {
    close();
    onSettings?.();
  };

  const handleLogout = async () => {
    close();
    await onLogout?.();
  };

  return (
    <>
      <ProfileButton onPress={() => setOpen(true)} />

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={profileStyles.profileMenuRoot}>
          <Pressable style={profileStyles.profileMenuBackdrop} onPress={close} accessibilityLabel="Close menu" />
          <View style={profileStyles.profileMenuAnchor} pointerEvents="box-none">
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
