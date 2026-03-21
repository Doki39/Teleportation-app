import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import BackgroundParticles from "../components/BackgroundParticles";
import ProfileMenuButton from "../components/ProfileMenuButton";
import ImagePreviewModal from "../components/ImagePreviewModal";
import { getGeneratedPhotos } from "../services/libraryServices";
import { signOut } from "../services/authServices";
import { goBackOrHome } from "../utils/navigationHelpers";
import { libraryStyles } from "../styles/libraryStyles";
import { promptStyles } from "../styles/promptStyles";
import { ui } from "../theme/ui";
import { buildImageUri } from "../utils/photoUtils";

const LIST_HORIZONTAL_PAD = 16;
const TILE_GAP = 10;
const NUM_COLUMNS = 3;

export default function LibraryScreen({ navigation }) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const tileWidth =
    (windowWidth - LIST_HORIZONTAL_PAD * 2 - TILE_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
  const [loggedIn, setLoggedIn] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewUri, setPreviewUri] = useState(null);
  const [previewName, setPreviewName] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) setLoggedIn(true);
    };
    checkLogin();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getGeneratedPhotos();
        if (!cancelled) setPhotos(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          Alert.alert("Error", err.message || "Failed to load pictures");
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

  const openPreview = useCallback((item) => {
    const uri = buildImageUri(item);
    if (!uri) return;
    setPreviewUri(uri);
    const id = item?.id != null ? String(item.id) : "photo";
    setPreviewName(`teleport-${id}.jpg`);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewUri(null);
    setPreviewName(null);
  }, []);

  const renderItem = useCallback(
    ({ item }) => {
      const uri = buildImageUri(item);
      return (
        <TouchableOpacity
          style={[libraryStyles.libraryTile, { width: tileWidth }]}
          onPress={() => openPreview(item)}
          activeOpacity={0.85}
          accessibilityRole="imagebutton"
          accessibilityLabel="Open image preview"
        >
          {uri ? (
            <Image source={{ uri }} style={libraryStyles.libraryTileImage} resizeMode="cover" />
          ) : (
            <View style={[libraryStyles.libraryTileImage, { justifyContent: "center", alignItems: "center" }]}>
              <Ionicons name="image-outline" size={32} color={ui.colors.muted} />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [openPreview, tileWidth]
  );

  return (
    <View style={libraryStyles.libraryScreen}>
      <BackgroundParticles width={windowWidth} height={windowHeight} />

      <ProfileMenuButton showLogout={loggedIn} onLogout={() => signOut({ navigation })} />

      <View style={promptStyles.promptHeader}>
        <TouchableOpacity
          style={promptStyles.promptBackBtn}
          onPress={() => goBackOrHome(navigation)}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <Ionicons name="arrow-back" size={20} color={ui.colors.muted} />
        </TouchableOpacity>
        <View style={promptStyles.promptHeaderText}>
          <Text style={promptStyles.promptHeaderTitle}>Library</Text>
          <Text style={promptStyles.promptHeaderSubtitle}>Tap a photo to preview or download</Text>
        </View>
        <View style={promptStyles.promptBackBtn}>
          <Ionicons name="images" size={20} color={ui.colors.primary} />
        </View>
      </View>

      {loading ? (
        <View style={libraryStyles.libraryLoadingWrap}>
          <ActivityIndicator size="large" color={ui.colors.primary} />
          <Text style={libraryStyles.libraryLoadingText}>Loading your photos…</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item, index) => String(item.id ?? index)}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={photos.length > 0 ? libraryStyles.libraryRow : undefined}
          contentContainerStyle={[
            libraryStyles.libraryListContent,
            photos.length === 0 && { flex: 1 },
          ]}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={libraryStyles.libraryEmptyWrap}>
              <Text style={libraryStyles.libraryEmptyTitle}>No photos yet</Text>
              <Text style={libraryStyles.libraryEmptySubtitle}>
                Generate an image from the home screen and it will show up here.
              </Text>
            </View>
          }
        />
      )}

      <ImagePreviewModal
        visible={!!previewUri}
        imageUri={previewUri}
        fileName={previewName}
        onClose={closePreview}
      />
    </View>
  );
}
