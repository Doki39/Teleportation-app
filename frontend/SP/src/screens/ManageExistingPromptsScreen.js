import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackgroundParticles from "../components/BackgroundParticles";
import HeaderBackButton from "../components/HeaderBackButton";
import { libraryStyles } from "../styles/libraryStyles";
import { promptStyles } from "../styles/promptStyles";
import { ui } from "../theme/ui";
import { goBackOrHome } from "../utils/navigationHelpers";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { getPromptSelection, updatePromptSelection, deletePromptSelection } from "../services/promptServices";
import { formatApiError } from "../services/userServices";
import { openLibrary, buildImageUri } from "../utils/photoUtils";
import { uploadPhotoToDrive } from "../services/photoServices";

function PromptRow({ item, onEdit, onDelete, imageUri }) {
  return (
    <View style={promptStyles.promptMgmtListRow}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12, minWidth: 0 }}
        onPress={() => onEdit(item)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${item.title || "prompt"}`}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={promptStyles.promptMgmtListThumb} resizeMode="cover" />
        ) : (
          <View style={[promptStyles.promptMgmtListThumb, { justifyContent: "center", alignItems: "center" }]}>
            <Ionicons name="image-outline" size={22} color={ui.colors.muted} />
          </View>
        )}
        <View style={promptStyles.promptMgmtListTextCol}>
          <Text style={promptStyles.promptMgmtListTitle} numberOfLines={2}>
            {item.title?.trim() || "Untitled"}
          </Text>
          <Text style={promptStyles.promptMgmtListPrompt} numberOfLines={3} ellipsizeMode="tail">
            {item.prompt?.trim() || "—"}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={promptStyles.promptMgmtListRowActions}>
        <TouchableOpacity
          style={promptStyles.promptMgmtListDeleteBtn}
          onPress={() => onDelete(item)}
          accessibilityRole="button"
          accessibilityLabel="Delete prompt"
        >
          <Ionicons name="trash-outline" size={20} color="#F87171" />
        </TouchableOpacity>
        <TouchableOpacity
          style={promptStyles.promptMgmtListEditBtn}
          onPress={() => onEdit(item)}
          accessibilityRole="button"
          accessibilityLabel="Edit prompt"
        >
          <Ionicons name="pencil" size={20} color={ui.colors.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ManageExistingPromptsScreen({ navigation }) {
  const allowed = useRequireAdmin(navigation);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftPrompt, setDraftPrompt] = useState("");
  const [draftImageUrl, setDraftImageUrl] = useState("");

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletingPrompt, setDeletingPrompt] = useState(false);

  const loadPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPromptSelection();
      setPrompts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message || "Could not load prompts");
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (allowed) loadPrompts();
    }, [allowed, loadPrompts])
  );

  const openEdit = (item) => {
    setEditId(item.id);
    setDraftTitle(String(item.title ?? ""));
    setDraftPrompt(String(item.prompt ?? ""));
    setDraftImageUrl(String(item.image_url ?? ""));
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditId(null);
  };

  const pickNewImage = async () => {
    const payload = await openLibrary();
    if (!payload) return;
    setUploadingImage(true);
    try {
      const { imageUrl } = await uploadPhotoToDrive(payload);
      setDraftImageUrl(imageUrl);
    } catch (e) {
      Alert.alert("Upload failed", e.message || "Could not upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const confirmDelete = (item) => {
    setPendingDelete(item);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    if (deletingPrompt) return;
    setDeleteModalVisible(false);
    setPendingDelete(null);
  };

  const runConfirmedDelete = async () => {
    const item = pendingDelete;
    if (item?.id == null) return;
    setDeletingPrompt(true);
    try {
      await deletePromptSelection(item.id);
      if (editId === item.id) closeModal();
      setPrompts((prev) => prev.filter((p) => p.id !== item.id));
      setDeleteModalVisible(false);
      setPendingDelete(null);
    } catch (e) {
      Alert.alert("Delete failed", formatApiError(e));
    } finally {
      setDeletingPrompt(false);
    }
  };

  const saveEdit = async () => {
    if (editId == null) return;
    const t = draftTitle.trim();
    const p = draftPrompt.trim();
    const img = draftImageUrl.trim();
    if (!p) {
      Alert.alert("Validation", "Prompt text cannot be empty.");
      return;
    }
    if (!img) {
      Alert.alert("Validation", "Image URL is required.");
      return;
    }
    setSaving(true);
    try {
      await updatePromptSelection(editId, {
        title: t || "Untitled",
        prompt: p,
        image_url: img,
      });
      await loadPrompts();
      closeModal();
    } catch (e) {
      Alert.alert("Save failed", formatApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const previewUri = buildImageUri({ image_url: draftImageUrl });

  if (!allowed) {
    return (
      <View style={[libraryStyles.libraryScreen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={ui.colors.primary} />
      </View>
    );
  }

  return (
    <View style={libraryStyles.libraryScreen}>
      <BackgroundParticles width={width} height={height} />

      <View style={promptStyles.promptHeader}>
        <HeaderBackButton onPress={() => goBackOrHome(navigation)} />
        <View style={promptStyles.promptHeaderText}>
          <Text style={promptStyles.promptHeaderTitle}>Manage existing prompts</Text>
          <Text style={promptStyles.promptHeaderSubtitle}>
            {loading ? "Loading…" : `${prompts.length} destination${prompts.length === 1 ? "" : "s"}`}
          </Text>
        </View>
        <TouchableOpacity
          style={promptStyles.promptBackBtn}
          onPress={loadPrompts}
          accessibilityRole="button"
          accessibilityLabel="Refresh list"
        >
          <Ionicons name="refresh" size={20} color={ui.colors.muted} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={ui.colors.primary} />
        </View>
      ) : (
        <FlatList
          style={promptStyles.promptMgmtListScroll}
          data={prompts}
          keyExtractor={(item, index) => String(item?.id ?? index)}
          ListEmptyComponent={
            <Text style={{ color: ui.colors.muted, paddingVertical: 24, textAlign: "center" }}>
              No prompts in the database yet.
            </Text>
          }
          renderItem={({ item }) => (
            <PromptRow item={item} imageUri={buildImageUri(item)} onEdit={openEdit} onDelete={confirmDelete} />
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent statusBarTranslucent onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={[
            promptStyles.promptMgmtModalBackdrop,
            {
              paddingTop: Math.max(insets.top, 12),
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ]}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={promptStyles.promptMgmtModalScroll}
            contentContainerStyle={[promptStyles.promptMgmtModalScrollContent, { paddingBottom: 8 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[promptStyles.promptMgmtModalCard, { maxHeight: height * 0.92 }]}>
              <Text style={promptStyles.promptMgmtModalTitle}>Edit destination</Text>

              <View style={promptStyles.promptMgmtModalPreviewWrap}>
                {previewUri ? (
                  <Image source={{ uri: previewUri }} style={StyleSheet.absoluteFillObject} resizeMode="contain" />
                ) : (
                  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Ionicons name="image-outline" size={48} color={ui.colors.muted} />
                    <Text style={{ color: ui.colors.muted, marginTop: 8 }}>No image</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={promptStyles.promptMgmtChangeImageBtn}
                onPress={pickNewImage}
                disabled={uploadingImage || saving}
              >
                {uploadingImage ? (
                  <ActivityIndicator color={ui.colors.text} />
                ) : (
                  <>
                    <Ionicons name="image-outline" size={20} color={ui.colors.primary} />
                    <Text style={[promptStyles.promptMgmtModalBtnText, { color: ui.colors.text }]}>Change image</Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={promptStyles.promptMgmtLabel}>Title</Text>
              <TextInput
                style={promptStyles.promptMgmtInput}
                value={draftTitle}
                onChangeText={setDraftTitle}
                placeholder="Destination title"
                placeholderTextColor={ui.colors.muted}
                editable={!saving}
              />

              <Text style={promptStyles.promptMgmtLabel}>Prompt (Modify)</Text>
              <TextInput
                style={[promptStyles.promptMgmtInput, promptStyles.promptMgmtInputMultiline]}
                value={draftPrompt}
                onChangeText={setDraftPrompt}
                placeholder="Text sent as the Modify section"
                placeholderTextColor={ui.colors.muted}
                multiline
                editable={!saving}
              />

              <View style={promptStyles.promptMgmtModalActions}>
                <TouchableOpacity
                  style={[promptStyles.promptMgmtModalBtn, promptStyles.promptMgmtModalBtnSecondary]}
                  onPress={closeModal}
                  disabled={saving}
                >
                  <Text style={promptStyles.promptMgmtModalBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[promptStyles.promptMgmtModalBtn, promptStyles.promptMgmtModalBtnPrimary]}
                  onPress={saveEdit}
                  disabled={saving || uploadingImage}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={[promptStyles.promptMgmtModalBtnText, promptStyles.promptMgmtModalBtnTextLight]}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeDeleteModal}
      >
        <View style={[promptStyles.promptMgmtModalBackdrop, { justifyContent: "center", paddingTop: 0 }]}>
          <View style={[promptStyles.promptMgmtModalCard, { maxWidth: 400, maxHeight: undefined }]}>
            <Text style={promptStyles.promptMgmtModalTitle}>Delete prompt?</Text>
            <Text style={promptStyles.promptMgmtModalMessage}>
              Are you sure you want to delete this prompt? This cannot be undone.
            </Text>
            {pendingDelete?.title ? (
              <Text style={[promptStyles.promptMgmtModalMessage, { fontWeight: "600", color: ui.colors.text }]}>
                {String(pendingDelete.title).trim() || "Untitled"}
              </Text>
            ) : null}
            <View style={promptStyles.promptMgmtModalActions}>
              <TouchableOpacity
                style={[promptStyles.promptMgmtModalBtn, promptStyles.promptMgmtModalBtnSecondary]}
                onPress={closeDeleteModal}
                disabled={deletingPrompt}
              >
                <Text style={promptStyles.promptMgmtModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[promptStyles.promptMgmtModalBtn, promptStyles.promptMgmtModalBtnDanger]}
                onPress={runConfirmedDelete}
                disabled={deletingPrompt}
              >
                {deletingPrompt ? (
                  <ActivityIndicator color={ui.colors.text} />
                ) : (
                  <Text style={[promptStyles.promptMgmtModalBtnText, { color: "#FCA5A5" }]}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
