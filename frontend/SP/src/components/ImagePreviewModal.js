import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Image,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  useWindowDimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { promptStyles } from "../styles/promptStyles";
import { ui } from "../theme/ui";
import { saveRemoteImage, shareRemoteImage } from "../utils/saveRemoteImage";

const TOOLBAR_APPROX = 56;
const GAP = 12;
const EDGE = 12;

export default function ImagePreviewModal({ visible, imageUri, onClose, fileName }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [busyAction, setBusyAction] = useState(null);

  const handleDownload = async () => {
    if (!imageUri || busyAction) return;
    setBusyAction("download");
    try {
      await saveRemoteImage(imageUri, fileName || "teleport-photo.jpg");
    } catch (e) {
      Alert.alert("Download failed", e.message || "Could not save this image.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleShare = async () => {
    if (!imageUri || busyAction) return;
    setBusyAction("share");
    try {
      await shareRemoteImage(imageUri, fileName || "teleport-photo.jpg");
    } catch (e) {
      Alert.alert("Share failed", e.message || "Could not share this image.");
    } finally {
      setBusyAction(null);
    }
  };

  const statusBarTop = Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;
  const topPad = Math.max(EDGE, insets.top, statusBarTop) + (Platform.OS === "ios" ? 2 : 4);
  const bottomPad = Math.max(EDGE, insets.bottom + 12);
  const usableH = height - topPad - bottomPad;
  const maxW = width - EDGE * 2;
  const maxH = Math.max(
    180,
    usableH - TOOLBAR_APPROX - GAP
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={[
          styles.root,
          {
            paddingTop: topPad,
            paddingBottom: bottomPad,
            paddingHorizontal: EDGE,
          },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close preview"
        />

        <View style={[styles.card, { width: maxW, maxHeight: usableH }]} pointerEvents="box-none">
          <View style={styles.toolbar}>
            <TouchableOpacity
              style={[promptStyles.promptBackBtn, styles.toolBtn]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color={ui.colors.muted} />
            </TouchableOpacity>

            <View style={styles.toolbarActions}>
              <TouchableOpacity
                style={[styles.shareBtn, busyAction && styles.actionBtnBusy]}
                onPress={handleShare}
                disabled={!!busyAction || !imageUri}
                accessibilityRole="button"
                accessibilityLabel="Share image"
              >
                {busyAction === "share" ? (
                  <ActivityIndicator color={ui.colors.muted} size="small" />
                ) : (
                  <Ionicons name="share-outline" size={20} color={ui.colors.muted} />
                )}
                <Text style={styles.shareBtnText}>
                  {busyAction === "share" ? "Sharing…" : "Share"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  promptStyles.promptConfirmBtn,
                  styles.downloadBtn,
                  busyAction && styles.actionBtnBusy,
                ]}
                onPress={handleDownload}
                disabled={!!busyAction || !imageUri}
                accessibilityRole="button"
                accessibilityLabel="Download image"
              >
                {busyAction === "download" ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="download-outline" size={20} color="#fff" />
                )}
                <Text style={promptStyles.promptConfirmBtnText}>
                  {busyAction === "download" ? "Saving…" : "Download"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.imageWrap}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={[styles.image, { width: maxW, height: maxH }]}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "rgba(5,11,26,0.92)",
    alignItems: "center",
  },
  card: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    zIndex: 1,
    minHeight: 0,
  },
  imageWrap: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    borderRadius: 16,
    backgroundColor: ui.colors.glass,
    borderWidth: 1,
    borderColor: ui.colors.glassBorder,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: GAP,
    flexShrink: 0,
    flexGrow: 0,
  },
  toolBtn: {
    backgroundColor: ui.colors.glass,
  },
  toolbarActions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 12,
    minWidth: 0,
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: ui.colors.glass,
    borderWidth: 1,
    borderColor: ui.colors.glassBorder,
    minWidth: 0,
  },
  shareBtnText: {
    color: ui.colors.muted,
    fontWeight: "600",
    fontSize: 15,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },
  actionBtnBusy: {
    opacity: 0.85,
  },
});
