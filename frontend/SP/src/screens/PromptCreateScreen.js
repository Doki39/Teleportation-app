import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackgroundParticles from "../components/BackgroundParticles";
import HeaderBackButton from "../components/HeaderBackButton";
import { libraryStyles } from "../styles/libraryStyles";
import { promptStyles } from "../styles/promptStyles";
import { ui } from "../theme/ui";
import { goBackOrHome } from "../utils/navigationHelpers";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { openLibrary, buildImageUri } from "../utils/photoUtils";
import { uploadPhotoToDrive, generatePromptPreview } from "../services/photoServices";
import { createPromptSelection } from "../services/promptServices";
import { formatAxiosError } from "../utils/apiErrors";

export default function PromptCreateScreen({ navigation }) {
  const allowed = useRequireAdmin(navigation);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [sourceImageUrl, setSourceImageUrl] = useState("");
  const [generatedUri, setGeneratedUri] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef(null);

  const resetCreateForm = useCallback(() => {
    setTitle("");
    setPromptText("");
    setSourceImageUrl("");
    setGeneratedUri("");
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
  }, []);

  const canGeneratePreview =
    !!sourceImageUrl?.trim() && !!promptText.trim() && !uploading && !generating && !saving;

  const runGeneration = useCallback(async () => {
    if (!sourceImageUrl?.trim()) {
      Alert.alert("Reference image required", "Upload a reference image first.");
      return;
    }
    if (!promptText.trim()) {
      Alert.alert("Prompt required", "Enter the prompt text you want to use for the preview.");
      return;
    }
    setGenerating(true);
    try {
      const { processedUri } = await generatePromptPreview({
        imageUrl: sourceImageUrl,
        modifyText: promptText.trim(),
      });
      setGeneratedUri(processedUri || "");
    } catch (e) {
      Alert.alert("Generation failed", e.message || "Could not run preview");
    } finally {
      setGenerating(false);
    }
  }, [sourceImageUrl, promptText]);

  const pickImage = async () => {
    const payload = await openLibrary();
    if (!payload) return;
    setUploading(true);
    try {
      const { imageUrl } = await uploadPhotoToDrive(payload);
      setSourceImageUrl(imageUrl);
      setGeneratedUri("");
    } catch (e) {
      Alert.alert("Upload failed", e.message || "Could not upload image");
    } finally {
      setUploading(false);
    }
  };

  const discardResult = () => {
    setGeneratedUri("");
  };

  const savePrompt = async () => {
    if (!generatedUri?.trim()) {
      Alert.alert("Nothing to save", "Generate a preview first and confirm it looks good.");
      return;
    }
    const p = promptText.trim();
    if (!p) {
      Alert.alert("Prompt required", "Enter prompt text.");
      return;
    }
    setSaving(true);
    try {
      await createPromptSelection({
        title: title.trim() || "Untitled",
        prompt: p,
        image_url: generatedUri.trim(),
      });
      resetCreateForm();
      Alert.alert("Saved", "New destination prompt was added.");
    } catch (e) {
      Alert.alert("Save failed", formatAxiosError(e));
    } finally {
      setSaving(false);
    }
  };

  const sourcePreviewUri = buildImageUri({ image_url: sourceImageUrl });
  const generatedPreviewUri = generatedUri ? buildImageUri({ image_url: generatedUri }) : null;

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
          <Text style={promptStyles.promptHeaderTitle}>Create prompt</Text>
          <Text style={promptStyles.promptHeaderSubtitle}>Upload, generate, confirm</Text>
        </View>
        <View style={promptStyles.promptBackBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? Math.max(insets.top, 12) : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={promptStyles.promptMgmtCreateScroll}
          contentContainerStyle={promptStyles.promptMgmtCreateScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={promptStyles.promptMgmtFieldBox}>
            <Text style={promptStyles.promptMgmtFieldBoxLabel}>Title</Text>
            <TextInput
              style={[promptStyles.promptMgmtInput, { marginBottom: 0 }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Destination name"
              placeholderTextColor={ui.colors.muted}
            />
          </View>

          <View style={promptStyles.promptMgmtFieldBox}>
            <Text style={promptStyles.promptMgmtFieldBoxLabel}>Prompt</Text>
            <TextInput
              style={[promptStyles.promptMgmtInput, promptStyles.promptMgmtInputMultiline, { marginBottom: 0 }]}
              value={promptText}
              onChangeText={(t) => {
                setPromptText(t);
                if (generatedUri) setGeneratedUri("");
              }}
              placeholder="Modify instructions (sent to NanoBanana)"
              placeholderTextColor={ui.colors.muted}
              multiline
            />
          </View>

          <Text style={promptStyles.promptMgmtCreateSectionLabel}>Reference image</Text>
          <Text style={[promptStyles.promptMgmtHint, { marginBottom: 8 }]}>
            Upload an image and fill the prompt, then tap Generate preview (nothing runs until you do).
          </Text>
          <View style={promptStyles.promptMgmtCreatePreviewWrap}>
            {sourcePreviewUri ? (
              <Image source={{ uri: sourcePreviewUri }} style={StyleSheet.absoluteFillObject} resizeMode="contain" />
            ) : (
              <View style={[StyleSheet.absoluteFillObject, { justifyContent: "center", alignItems: "center" }]}>
                <Ionicons name="image-outline" size={48} color={ui.colors.muted} />
                <Text style={{ color: ui.colors.muted, marginTop: 8 }}>No image yet</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={promptStyles.promptMgmtChangeImageBtn}
            onPress={pickImage}
            disabled={uploading || generating || saving}
          >
            {uploading ? (
              <ActivityIndicator color={ui.colors.text} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color={ui.colors.primary} />
                <Text style={[promptStyles.promptMgmtModalBtnText, { color: ui.colors.text }]}>
                  {sourceImageUrl ? "Change image" : "Upload image"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              promptStyles.promptMgmtGeneratePreviewBtn,
              !canGeneratePreview && promptStyles.promptMgmtGeneratePreviewBtnDisabled,
            ]}
            onPress={runGeneration}
            disabled={!canGeneratePreview}
            accessibilityRole="button"
            accessibilityLabel="Generate preview"
          >
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={[promptStyles.promptMgmtModalBtnText, promptStyles.promptMgmtModalBtnTextLight]}>
              Generate preview
            </Text>
          </TouchableOpacity>

          {generating && (
            <View style={{ alignItems: "center", paddingVertical: 12 }}>
              <ActivityIndicator size="large" color={ui.colors.primary} />
              <Text style={{ color: ui.colors.muted, marginTop: 8 }}>Generating preview…</Text>
            </View>
          )}

          {!!generatedPreviewUri && !generating && (
            <>
              <Text style={[promptStyles.promptMgmtCreateSectionLabel, { marginTop: 12 }]}>AI preview</Text>
              <View style={promptStyles.promptMgmtCreatePreviewWrap}>
                <Image source={{ uri: generatedPreviewUri }} style={StyleSheet.absoluteFillObject} resizeMode="contain" />
              </View>

              <View style={promptStyles.promptMgmtCreateConfirmBar}>
                <Text style={promptStyles.promptMgmtCreateConfirmText}>Good enough to add to the library?</Text>
                <View style={promptStyles.promptMgmtCreateBtnRow}>
                  <TouchableOpacity
                    style={[promptStyles.promptMgmtCreateBtn, promptStyles.promptMgmtCreateBtnNo]}
                    onPress={discardResult}
                    disabled={saving}
                  >
                    <Text style={promptStyles.promptMgmtModalBtnText}>Discard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[promptStyles.promptMgmtCreateBtn, promptStyles.promptMgmtCreateBtnYes]}
                    onPress={savePrompt}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={[promptStyles.promptMgmtModalBtnText, promptStyles.promptMgmtModalBtnTextLight]}>
                        Save
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
