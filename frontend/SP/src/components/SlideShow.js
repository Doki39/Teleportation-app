import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { homeStyles } from "../styles/homeStyles";
import { ui } from "../theme/ui";
import { buildImageUri } from "../utils/photoUtils";
import { getPhotosForSlide } from "../services/libraryServices";

const SLIDE_LAYOUT =
  Platform.OS === "web"
    ? { width: 330, height: 186, borderRadius: 20 }
    : { width: 248, height: 140, borderRadius: 15 };

const SLIDE_WIDTH = SLIDE_LAYOUT.width;
const SLIDE_HEIGHT = SLIDE_LAYOUT.height;
const SLIDE_BORDER_RADIUS = SLIDE_LAYOUT.borderRadius;
const DEFAULT_ROTATE_MS = 3500;

export default function SlideShow({
  title = "Where people went with us",
  rotateIntervalMs = DEFAULT_ROTATE_MS,
}) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getPhotosForSlide();
        if (!cancelled) setPhotos(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setPhotos([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (photos.length <= 1) return undefined;
    const id = setInterval(() => {
      const next = (indexRef.current + 1) % photos.length;
      indexRef.current = next;
      listRef.current?.scrollToOffset({
        offset: next * SLIDE_WIDTH,
        animated: true,
      });
    }, rotateIntervalMs);
    return () => clearInterval(id);
  }, [photos.length, rotateIntervalMs]);

  const renderItem = useCallback(({ item }) => {
    const uri = buildImageUri(item);
    const locationLabel =
      typeof item?.location === "string"
        ? item.location.trim()
        : item?.location != null
          ? String(item.location).trim()
          : "";
    return (
      <View style={[homeStyles.slidePage, { width: SLIDE_WIDTH, height: SLIDE_HEIGHT }]}>
        {uri ? (
          <Image source={{ uri }} style={homeStyles.slideImage} resizeMode="cover" />
        ) : (
          <View style={[homeStyles.slideImage, { backgroundColor: "rgba(255,255,255,0.06)" }]} />
        )}
        {locationLabel ? (
          <View style={homeStyles.slideLocationOverlay} pointerEvents="none">
            <Text style={homeStyles.slideLocationText} numberOfLines={2}>
              {locationLabel}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }, []);

  return (
    <View style={[homeStyles.slideShowSection, { width: SLIDE_WIDTH }]}>
      <Text style={homeStyles.slideShowSectionTitle}>{title}</Text>
      <View
        style={[
          homeStyles.slideShowContainer,
          {
            width: SLIDE_WIDTH,
            height: SLIDE_HEIGHT,
            borderRadius: SLIDE_BORDER_RADIUS,
          },
        ]}
      >
        {loading ? (
          <View style={[homeStyles.slideShowLoading, { width: SLIDE_WIDTH, height: SLIDE_HEIGHT }]}>
            <ActivityIndicator size="large" color={ui.colors.primary} />
          </View>
        ) : photos.length > 0 ? (
          <FlatList
            ref={listRef}
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT }}
            decelerationRate="fast"
            keyExtractor={(item, index) => String(item?.id ?? index)}
            getItemLayout={(_, index) => ({
              length: SLIDE_WIDTH,
              offset: SLIDE_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const idx = Math.round(x / SLIDE_WIDTH);
              indexRef.current = Math.max(0, Math.min(idx, photos.length - 1));
            }}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                listRef.current?.scrollToOffset({
                  offset: info.index * SLIDE_WIDTH,
                  animated: true,
                });
              }, 300);
            }}
            renderItem={renderItem}
          />
        ) : (
          <View style={[homeStyles.slideShowEmpty, { width: SLIDE_WIDTH, height: SLIDE_HEIGHT }]}>
            <Ionicons name="images-outline" size={36} color={ui.colors.muted} />
            <Text style={homeStyles.slideShowEmptyText}>No previews</Text>
          </View>
        )}
      </View>
    </View>
  );
}
