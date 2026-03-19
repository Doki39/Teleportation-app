import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commonStyles } from "../styles/commonStyles";
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
  const ANGLE_STEP = 360 / COUNT;
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
    if (currentIndex < prompts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const snapToIndex = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const handleSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);

  const handleCardPress = (item, index) => {
    const isFront = index === currentIndex;
    if (isFront) {
      setSelectedId(selectedId === item.id ? null : item.id);
    } else {
      snapToIndex(index);
    }
  };

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
    <View style={commonStyles.promptScreen}>
      <ProfileButton onPress={() => Alert.alert("Not implemented", "Settings screen is not implemented yet.")} />
      <View style={commonStyles.promptHeader}>
        <TouchableOpacity style={commonStyles.promptBackBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={ui.colors.muted} />
        </TouchableOpacity>
        <View style={commonStyles.promptHeaderText}>
          <Text style={commonStyles.promptHeaderTitle}>Select Destination</Text>
          <Text style={commonStyles.promptHeaderSubtitle}>Spin the portal wheel to choose</Text>
        </View>
        <View style={commonStyles.promptBackBtn}>
          <Ionicons name="sparkles" size={20} color={ui.colors.primary} />
        </View>
      </View>
      <View style={commonStyles.promptParticles} pointerEvents="none">
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: (i * 137) % SCREEN_WIDTH,
              top: (i * 97) % SCREEN_HEIGHT,
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: "rgba(124,58,237,0.3)",
            }}
          />
        ))}
      </View>
      <View style={commonStyles.promptCarouselWrap}>
        {prompts.length > 0 && (
          <View
            style={{
              position: "absolute",
              width: radius * 2.5,
              height: radius * 1.2,
              borderRadius: 999,
              opacity: 0.3,
              shadowColor: ui.colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 60,
              elevation: 20,
            }}
          />
        )}
        <View style={commonStyles.promptNavArrowRow}>
          <TouchableOpacity
            style={[commonStyles.promptNavArrow, commonStyles.promptNavLeft]}
            onPress={goPrev}
            disabled={currentIndex === 0}
          >
            <Ionicons name="chevron-back" size={20} color={ui.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[commonStyles.promptNavArrow, commonStyles.promptNavRight]}
            onPress={goNext}
            disabled={currentIndex === prompts.length - 1 || prompts.length === 0}
          >
            <Ionicons name="chevron-forward" size={20} color={ui.colors.primary} />
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={commonStyles.promptCylinder}>
            <ActivityIndicator size="large" color={ui.colors.primary} />
            <Text style={{ color: ui.colors.muted, marginTop: 12 }}>Loading prompts...</Text>
          </View>
        ) : prompts.length === 0 ? (
          <View style={commonStyles.promptCylinder}>
            <Text style={{ color: ui.colors.muted }}>No prompts available</Text>
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
            commonStyles={commonStyles}
          />
        )}
        {prompts.length > 0 && (
          <View style={commonStyles.promptDestInfo}>
            <Text style={commonStyles.promptDestTitle}>
              {getEmoji(prompts[currentIndex])} {getLabel(prompts[currentIndex])}
            </Text>
            <Text
              style={[
                commonStyles.promptDestSubtitle,
                selectedId === prompts[currentIndex]?.id && commonStyles.promptDestSubtitleSelected,
              ]}
            >
              {selectedId === prompts[currentIndex]?.id
                ? "✓ Locked in — ready to teleport"
                : "Tap card or press Enter to select"}
            </Text>
          </View>
        )}
        {prompts.length > 0 && (
          <View style={commonStyles.promptDots}>
            {prompts.map((p, i) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => snapToIndex(i)}
                style={[
                  commonStyles.promptDot,
                  i === currentIndex && commonStyles.promptDotActive,
                  selectedId === p.id && i !== currentIndex && commonStyles.promptDotSelected,
                ]}
              />
            ))}
          </View>
        )}
      </View>
      <View style={commonStyles.promptConfirmBar}>
        <TouchableOpacity
          style={[
            commonStyles.promptConfirmBtn,
            (!selectedId || isProcessing) && commonStyles.promptConfirmBtnDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!selectedId || isProcessing}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={commonStyles.promptConfirmBtnText}>Teleporting...</Text>
            </>
          ) : (
            <>
              <Ionicons name="flash" size={20} color={selectedId ? "#fff" : ui.colors.muted} />
              <Text style={[commonStyles.promptConfirmBtnText, !selectedId && commonStyles.promptConfirmBtnTextDisabled]}>
                Confirm Teleportation
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
