import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  promptStyles,
  PROMPT_WHEEL_ITEM_SIZE,
  PROMPT_WHEEL_ITEM_GAP,
} from "../styles/promptStyles";
import { ui } from "../theme/ui";
import { sendPhotoToGenerate } from "../services/photoServices";
import { getPromptSelection } from "../services/promptServices";
import { API_BASE_URL } from "../config/api";
import ProfileButton from "../components/ProfileButton";
import Cylinder3D from "../components/Cylinder3D";

const CARD_WIDTH = 300;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PromptSelectionScreen({ route, navigation }) {
  const { imageUrl } = route.params || {};

  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const COUNT = Math.max(prompts.length, 1);
  const radius = prompts.length > 0 ? CARD_WIDTH / (2 * Math.tan(Math.PI / COUNT)) : 200;

  useEffect(() => {
    async function loadPrompts() {
      try {
        const data = await getPromptSelection();
        setPrompts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    }
    loadPrompts();
  }, []);

  const goNext = () => {
    if (prompts.length === 0) return;
    snapToIndex((currentIndex + 1) % prompts.length);
  };

  const goPrev = () => {
    if (prompts.length === 0) return;
    snapToIndex((currentIndex - 1 + prompts.length) % prompts.length);
  };

  const snapToIndex = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const handleSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);

  async function handleConfirm() {
    if (!selectedId) return;
    const selected = prompts.find((p) => p.id === selectedId);
    if (!selected) return;

    setIsProcessing(true);
    try {
      await sendPhotoToGenerate(imageUrl, selected.prompt);
      navigation.replace("Library");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to generate image.");
    } finally {
      setIsProcessing(false);
    }
  }

  const getImageUri = useCallback((item) => {
    const url = item.image_url;
    if (!url) return null;
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  }, []);

  const getLabel = useCallback((item) => {
    const p = item.prompt || "";
    return p.length > 40 ? p.slice(0, 40) + "..." : p;
  }, []);

  const getEmoji = useCallback((item) => item.emoji || "✨", []);

  const wheelScrollRef = useRef(null);
  const isWheelProgrammatic = useRef(false);
  const lastChangeFromWheel = useRef(false);

  useEffect(() => {
    if (Platform.OS === "web" || prompts.length === 0) return;
    if (lastChangeFromWheel.current) {
      lastChangeFromWheel.current = false;
      return;
    }
    const itemWidth = PROMPT_WHEEL_ITEM_SIZE + PROMPT_WHEEL_ITEM_GAP;
    if (!wheelScrollRef.current) return;
    isWheelProgrammatic.current = true;
    wheelScrollRef.current.scrollTo({
      x: currentIndex * itemWidth,
      animated: true,
    });
    const t = setTimeout(() => { isWheelProgrammatic.current = false; }, 800);
    return () => clearTimeout(t);
  }, [currentIndex, prompts.length]);

  const handleWheelScrollEnd = useCallback((e) => {
    if (isWheelProgrammatic.current) return;
    const offset = e.nativeEvent.contentOffset.x;
    const itemWidth = PROMPT_WHEEL_ITEM_SIZE + PROMPT_WHEEL_ITEM_GAP;
    const index = Math.round(offset / itemWidth);
    if (index >= 0 && index < prompts.length && index !== currentIndex) {
      lastChangeFromWheel.current = true;
      snapToIndex(index);
    }
  }, [prompts.length, currentIndex, snapToIndex]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handler = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Enter" && prompts[currentIndex]) {
        setSelectedId(selectedId === prompts[currentIndex].id ? null : prompts[currentIndex].id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex, selectedId, prompts]);

  return (
    <View style={promptStyles.promptScreen}>
      <ProfileButton onPress={() => Alert.alert("Not implemented", "Settings screen is not implemented yet.")} />
      <View style={promptStyles.promptHeader}>
        <TouchableOpacity style={promptStyles.promptBackBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={ui.colors.muted} />
        </TouchableOpacity>
        <View style={promptStyles.promptHeaderText}>
          <Text style={promptStyles.promptHeaderTitle}>Select Destination</Text>
          <Text style={promptStyles.promptHeaderSubtitle}>Spin the portal wheel to choose</Text>
        </View>
        <View style={promptStyles.promptBackBtn}>
          <Ionicons name="sparkles" size={20} color={ui.colors.primary} />
        </View>
      </View>
      <View style={promptStyles.promptParticles} pointerEvents="none">
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={i}
            style={[
              promptStyles.promptParticleDot,
              { left: (i * 137) % SCREEN_WIDTH, top: (i * 97) % SCREEN_HEIGHT },
            ]}
          />
        ))}
      </View>
      <View style={promptStyles.promptCarouselWrap}>
        {prompts.length > 0 && (
          <View
            style={[
              promptStyles.promptPortalCarouselGlow,
              { width: radius * 2.5, height: radius * 1.2 },
            ]}
          />
        )}
        <View style={promptStyles.promptNavArrowRow}>
          <TouchableOpacity
            style={[promptStyles.promptNavArrow, promptStyles.promptNavLeft]}
            onPress={goPrev}
            disabled={prompts.length === 0}
          >
            <Ionicons name="chevron-back" size={20} color={ui.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[promptStyles.promptNavArrow, promptStyles.promptNavRight]}
            onPress={goNext}
            disabled={prompts.length === 0}
          >
            <Ionicons name="chevron-forward" size={20} color={ui.colors.primary} />
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={promptStyles.promptCylinder}>
            <ActivityIndicator size="large" color={ui.colors.primary} />
            <Text style={promptStyles.promptCylinderLoadingText}>Loading prompts...</Text>
          </View>
        ) : prompts.length === 0 ? (
          <View style={promptStyles.promptCylinder}>
            <Text style={promptStyles.promptCylinderMutedText}>No prompts available</Text>
          </View>
        ) : (
          <Cylinder3D
            prompts={prompts}
            currentIndex={currentIndex}
            selectedId={selectedId}
            onSelect={handleSelect}
            onSnapToIndex={snapToIndex}
            getImageUri={getImageUri}
            getLabel={getLabel}
            getEmoji={getEmoji}
          />
        )}
        {prompts.length > 0 && (
          <View style={promptStyles.promptDestInfo}>
            <Text style={promptStyles.promptDestTitle}>
              {getEmoji(prompts[currentIndex])} {getLabel(prompts[currentIndex])}
            </Text>
            <Text
              style={[
                promptStyles.promptDestSubtitle,
                selectedId === prompts[currentIndex]?.id && promptStyles.promptDestSubtitleSelected,
              ]}
            >
              {selectedId === prompts[currentIndex]?.id
                ? "✓ Locked in — ready to teleport"
                : "Tap card or press Enter to select"}
            </Text>
          </View>
        )}
        {prompts.length > 0 && Platform.OS !== "web" && (
          <View style={promptStyles.promptScrollWheelWrap}>
            <ScrollView
              ref={wheelScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleWheelScrollEnd}
              scrollEventThrottle={16}
              snapToOffsets={prompts.map(
                (_, i) => i * (PROMPT_WHEEL_ITEM_SIZE + PROMPT_WHEEL_ITEM_GAP)
              )}
              snapToAlignment="center"
              decelerationRate="fast"
              disableIntervalMomentum
              contentContainerStyle={[
                promptStyles.promptScrollWheelContent,
                {
                  paddingHorizontal:
                    (SCREEN_WIDTH - PROMPT_WHEEL_ITEM_SIZE - PROMPT_WHEEL_ITEM_GAP) / 2,
                },
              ]}
              style={promptStyles.promptScrollWheel}
            >
              {prompts.map((p, i) => {
                const uri = getImageUri(p);
                const isActive = i === currentIndex;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => snapToIndex(i)}
                    style={[
                      promptStyles.promptScrollWheelItem,
                      isActive && promptStyles.promptScrollWheelItemActive,
                      selectedId === p.id && promptStyles.promptScrollWheelItemSelected,
                    ]}
                  >
                    {uri ? (
                      <Image
                        source={{ uri }}
                        style={promptStyles.promptScrollWheelThumb}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          promptStyles.promptScrollWheelThumb,
                          promptStyles.promptScrollWheelThumbPlaceholder,
                        ]}
                      >
                        <Text style={promptStyles.promptScrollWheelEmoji}>{getEmoji(p)}</Text>
                      </View>
                    )}
                    {uri && (
                      <View style={promptStyles.promptScrollWheelEmojiBadge}>
                        <Text style={promptStyles.promptScrollWheelEmojiBadgeText}>
                          {getEmoji(p)}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
        {prompts.length > 0 && Platform.OS === "web" && (
          <View style={promptStyles.promptDots}>
            {prompts.map((p, i) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => snapToIndex(i)}
                style={[
                  promptStyles.promptDot,
                  i === currentIndex && promptStyles.promptDotActive,
                  selectedId === p.id && i !== currentIndex && promptStyles.promptDotSelected,
                ]}
              />
            ))}
          </View>
        )}
      </View>
      <View style={promptStyles.promptConfirmBar}>
        <TouchableOpacity
          style={[
            promptStyles.promptConfirmBtn,
            (!selectedId || isProcessing) && promptStyles.promptConfirmBtnDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!selectedId || isProcessing}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={promptStyles.promptConfirmBtnText}>Teleporting...</Text>
            </>
          ) : (
            <>
              <Ionicons name="flash" size={20} color={selectedId ? "#fff" : ui.colors.muted} />
              <Text style={[promptStyles.promptConfirmBtnText, !selectedId && promptStyles.promptConfirmBtnTextDisabled]}>
                Confirm Teleportation
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
