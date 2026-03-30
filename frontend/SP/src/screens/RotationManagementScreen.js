import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BackgroundParticles from "../components/BackgroundParticles";
import HeaderBackButton from "../components/HeaderBackButton";
import ConnectedProfileMenuButton from "../components/ConnectedProfileMenuButton";
import { getGeneratedPhotos, normalizePhotosListResponse } from "../services/libraryServices";
import { getPhotoRotationList, postPhotoRotation, deletePhotoRotation } from "../services/adminServices";
import { libraryStyles } from "../styles/libraryStyles";
import { promptStyles } from "../styles/promptStyles";
import { ui } from "../theme/ui";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { buildImageUri } from "../utils/photoUtils";

const LIST_HORIZONTAL_PAD = 16;
const TILE_GAP = 10;
const NUM_COLUMNS = 3;
const RECENT_COUNT = 10;

function getStoredImageUrl(item) {
  if (!item || typeof item !== "object") return "";
  const path =
    item.processed_uri ?? item.processed_image_uri ?? item.image_url ?? item.imageUrl ?? "";
  return String(path).trim();
}

export default function RotationManagementScreen({ navigation }) {
  const allowed = useRequireAdmin(navigation);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const tileWidth =
    (windowWidth - LIST_HORIZONTAL_PAD * 2 - TILE_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  const [photos, setPhotos] = useState([]);
  const [rotationEntries, setRotationEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const recentPhotos = useMemo(() => (Array.isArray(photos) ? photos.slice(0, RECENT_COUNT) : []), [photos]);

  const refreshRotation = useCallback(async () => {
    const rows = await getPhotoRotationList();
    setRotationEntries(Array.isArray(rows) ? rows : []);
  }, []);

  const removeEntry = useCallback(
    async (id) => {
      try {
        await deletePhotoRotation(id);
        await refreshRotation();
      } catch (e) {
        Alert.alert("Error", e.message || "Could not remove");
      }
    },
    [refreshRotation]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rot, photoData] = await Promise.all([
          getPhotoRotationList(),
          getGeneratedPhotos({ page: 1, limit: RECENT_COUNT }),
        ]);
        if (!cancelled) {
          setRotationEntries(Array.isArray(rot) ? rot : []);
          setPhotos(normalizePhotosListResponse(photoData));
        }
      } catch (e) {
        if (!cancelled) {
          Alert.alert("Error", e.message || "Failed to load");
          setRotationEntries([]);
          setPhotos([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onRemoveEntry = useCallback(
    (id) => {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const confirmed = window.confirm(
          "This slide will no longer appear on the home page. Do you want to remove it?"
        );
        if (confirmed) {
          void removeEntry(id);
        }
        return;
      }

      Alert.alert(
        "Remove from rotation",
        "This slide will no longer appear on the home page.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              void removeEntry(id);
            },
          },
        ]
      );
    },
    [removeEntry]
  );

  const openLocationModal = useCallback((item) => {
    const url = getStoredImageUrl(item);
    if (!url) {
      Alert.alert("Missing image", "This photo has no stored image URL.");
      return;
    }
    setPendingImageUrl(url);
    setLocationInput("");
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setPendingImageUrl("");
    setLocationInput("");
  }, []);

  const submitRotation = useCallback(async () => {
    const loc = locationInput.trim();
    if (!loc) {
      Alert.alert("Location required", "Enter a location label for the home slideshow.");
      return;
    }
    if (!pendingImageUrl) return;

    setSubmitting(true);
    try {
      await postPhotoRotation({ imageUrl: pendingImageUrl, location: loc });
      closeModal();
      await refreshRotation();
      Alert.alert("Added", "Photo was added to the home rotation.");
    } catch (e) {
      Alert.alert("Error", e.message || "Could not save rotation entry.");
    } finally {
      setSubmitting(false);
    }
  }, [closeModal, locationInput, pendingImageUrl, refreshRotation]);

  const renderItem = useCallback(
    ({ item }) => {
      const uri = buildImageUri(item);
      return (
        <View style={[libraryStyles.libraryTile, { width: tileWidth }]}>
          {uri ? (
            <Image source={{ uri }} style={libraryStyles.libraryTileImage} resizeMode="cover" />
          ) : (
            <View style={[libraryStyles.libraryTileImage, { justifyContent: "center", alignItems: "center" }]}>
              <Ionicons name="image-outline" size={32} color={ui.colors.muted} />
            </View>
          )}
          <TouchableOpacity
            style={libraryStyles.rotationAddBtn}
            onPress={() => openLocationModal(item)}
            accessibilityRole="button"
            accessibilityLabel="Add to home rotation"
          >
            <Text style={libraryStyles.rotationAddBtnText}>Add to rotation</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [openLocationModal, tileWidth]
  );

  const listHeader = useMemo(
    () => (
      <View>
        <Text style={libraryStyles.rotationSectionTitle}>Current rotation</Text>
        {rotationEntries.length === 0 ? (
          <Text style={libraryStyles.rotationCurrentEmpty}>No slides on the home page yet.</Text>
        ) : (
          rotationEntries.map((entry) => {
            const uri = buildImageUri({ image_url: entry.image_url, processed_uri: entry.image_url });
            return (
              <View key={entry.id} style={libraryStyles.rotationCurrentRow}>
                {uri ? (
                  <Image source={{ uri }} style={libraryStyles.rotationCurrentThumb} resizeMode="cover" />
                ) : (
                  <View style={[libraryStyles.rotationCurrentThumb, { justifyContent: "center", alignItems: "center" }]}>
                    <Ionicons name="image-outline" size={24} color={ui.colors.muted} />
                  </View>
                )}
                <View style={libraryStyles.rotationCurrentMeta}>
                  <Text style={libraryStyles.rotationCurrentLocation} numberOfLines={2}>
                    {entry.location}
                  </Text>
                  <Text style={[promptStyles.promptMgmtModalMessage, { marginTop: 4, fontSize: 11 }]} numberOfLines={1}>
                    id #{entry.id}
                  </Text>
                </View>
                <TouchableOpacity
                  style={libraryStyles.rotationRemoveBtn}
                  onPress={() => onRemoveEntry(entry.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Remove from rotation"
                >
                  <Text style={libraryStyles.rotationRemoveBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <Text style={[libraryStyles.rotationSectionTitle, { marginTop: 8 }]}>Add from recent</Text>
        <Text style={[promptStyles.promptMgmtModalMessage, { paddingHorizontal: 16, marginBottom: 12 }]}>
          Last {RECENT_COUNT} generated photos (newest first). Add one to the public home slideshow with a location
          label.
        </Text>
      </View>
    ),
    [rotationEntries, onRemoveEntry]
  );

  if (!allowed) {
    return (
      <View style={[libraryStyles.libraryScreen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={ui.colors.primary} />
      </View>
    );
  }

  return (
    <View style={libraryStyles.libraryScreen}>
      <BackgroundParticles width={windowWidth} height={windowHeight} />

      <ConnectedProfileMenuButton />

      <View style={promptStyles.promptHeader}>
        <HeaderBackButton onPress={() => navigation.goBack()} />
        <View style={promptStyles.promptHeaderText}>
          <Text style={promptStyles.promptHeaderTitle}>Rotation management</Text>
          <Text style={promptStyles.promptHeaderSubtitle}>Home slideshow</Text>
        </View>
        <View style={promptStyles.promptBackBtn} />
      </View>

      {loading ? (
        <View style={libraryStyles.libraryLoadingWrap}>
          <ActivityIndicator size="large" color={ui.colors.primary} />
          <Text style={libraryStyles.libraryLoadingText}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={recentPhotos}
          keyExtractor={(item, index) => `recent-${item.id ?? index}`}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={recentPhotos.length > 0 ? libraryStyles.libraryRow : undefined}
          ListHeaderComponent={listHeader}
          contentContainerStyle={[
            libraryStyles.libraryListContent,
            recentPhotos.length === 0 && rotationEntries.length === 0 && { flex: 1 },
          ]}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={libraryStyles.libraryEmptyWrap}>
              <Text style={libraryStyles.libraryEmptyTitle}>No recent photos</Text>
              <Text style={libraryStyles.libraryEmptySubtitle}>
                Generate images from the home screen and they will appear here to add to the rotation.
              </Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={promptStyles.promptMgmtModalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={promptStyles.promptMgmtModalCard}>
            <Text style={promptStyles.promptMgmtModalTitle}>Location</Text>
            <Text style={[promptStyles.promptMgmtModalMessage, { marginBottom: 12 }]}>
              This label appears on the home page slideshow (e.g. city or landmark).
            </Text>
            <Text style={promptStyles.promptMgmtLabel}>Location</Text>
            <TextInput
              style={promptStyles.promptMgmtInput}
              value={locationInput}
              onChangeText={setLocationInput}
              placeholder="e.g. Paris, France"
              placeholderTextColor={ui.colors.muted}
              autoCapitalize="sentences"
              editable={!submitting}
            />
            <View style={[promptStyles.promptMgmtModalActions, { marginTop: 8 }]}>
              <TouchableOpacity
                style={[promptStyles.promptMgmtModalBtn, promptStyles.promptMgmtModalBtnSecondary]}
                onPress={closeModal}
                disabled={submitting}
              >
                <Text style={promptStyles.promptMgmtModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[promptStyles.promptMgmtModalBtn, promptStyles.promptMgmtModalBtnPrimary]}
                onPress={submitRotation}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[promptStyles.promptMgmtModalBtnText, promptStyles.promptMgmtModalBtnTextLight]}>
                    Add
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
