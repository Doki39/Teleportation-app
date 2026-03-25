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
import {
  imagePreviewModalStyles,
  IMAGE_PREVIEW_MODAL_TOOLBAR_GAP,
} from "../styles/imagePreviewModalStyles";
import { promptStyles } from "../styles/promptStyles";
import { ui } from "../theme/ui";
import { saveRemoteImage, shareRemoteImage } from "../utils/saveRemoteImage";

const TOOLBAR_APPROX = 56;
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
    usableH - TOOLBAR_APPROX - IMAGE_PREVIEW_MODAL_TOOLBAR_GAP
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={[
          imagePreviewModalStyles.root,
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

        <View
          style={[imagePreviewModalStyles.card, { width: maxW, maxHeight: usableH, pointerEvents: "box-none" }]}
        >
          <View style={imagePreviewModalStyles.toolbar}>
            <TouchableOpacity
              style={[promptStyles.promptBackBtn, imagePreviewModalStyles.toolBtn]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color={ui.colors.muted} />
            </TouchableOpacity>

            <View style={imagePreviewModalStyles.toolbarActions}>
              <TouchableOpacity
                style={[imagePreviewModalStyles.shareBtn, busyAction && imagePreviewModalStyles.actionBtnBusy]}
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
                <Text style={imagePreviewModalStyles.shareBtnText}>
                  {busyAction === "share" ? "Sharing…" : "Share"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  promptStyles.promptConfirmBtn,
                  imagePreviewModalStyles.downloadBtn,
                  busyAction && imagePreviewModalStyles.actionBtnBusy,
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

          <View style={imagePreviewModalStyles.imageWrap}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={[imagePreviewModalStyles.image, { width: maxW, height: maxH }]}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}
