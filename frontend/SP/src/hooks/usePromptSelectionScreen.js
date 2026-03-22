import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import {
  PROMPT_WHEEL_ITEM_GAP,
  PROMPT_WHEEL_ITEM_SIZE,
} from "../styles/promptStyles";
import { sendPhotoToGenerate } from "../services/photoServices";
import { getPromptSelection } from "../services/promptServices";
import { getPromptDisplayTitle } from "../utils/promptDisplay";
import { resolvePromptImageUri } from "../utils/promptSelectionHelpers";

export function usePromptSelectionScreen({ route, navigation }) {
  const { imageUrl } = route.params || {};

  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const wheelScrollRef = useRef(null);
  const isWheelProgrammatic = useRef(false);
  const lastChangeFromWheel = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getPromptSelection();
        if (!cancelled) setPrompts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setPrompts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const snapToIndex = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const goNext = useCallback(() => {
    if (prompts.length === 0) return;
    if (currentIndex < prompts.length - 1) {
      snapToIndex(currentIndex + 1);
    }
  }, [prompts.length, currentIndex, snapToIndex]);

  const goPrev = useCallback(() => {
    if (prompts.length === 0) return;
    if (currentIndex > 0) {
      snapToIndex(currentIndex - 1);
    }
  }, [prompts.length, currentIndex, snapToIndex]);

  const handleSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedId) return;
    const selected = prompts.find((p) => p.id === selectedId);
    if (!selected) return;

    setIsProcessing(true);
    try {
      await sendPhotoToGenerate(imageUrl, selected.id);
      navigation.replace("Library");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to generate image.");
    } finally {
      setIsProcessing(false);
    }
  }, [imageUrl, navigation, prompts, selectedId]);

  const getImageUri = useCallback((item) => resolvePromptImageUri(item), []);
  const getTitle = useCallback((item) => getPromptDisplayTitle(item), []);
  const getEmoji = useCallback((item) => item.emoji || "✨", []);

  useEffect(() => {
    if (Platform.OS === "web" || prompts.length === 0) return;
    if (lastChangeFromWheel.current) {
      lastChangeFromWheel.current = false;
      return;
    }
    const stride = PROMPT_WHEEL_ITEM_SIZE + PROMPT_WHEEL_ITEM_GAP;
    if (!wheelScrollRef.current) return;
    isWheelProgrammatic.current = true;
    wheelScrollRef.current?.scrollTo?.({
      x: currentIndex * stride,
      y: 0,
      animated: true,
    });
    const t = setTimeout(() => {
      isWheelProgrammatic.current = false;
    }, 400);
    return () => clearTimeout(t);
  }, [currentIndex, prompts.length]);

  const handleWheelScrollEnd = useCallback(
    (e) => {
      if (isWheelProgrammatic.current) return;
      const stride = PROMPT_WHEEL_ITEM_SIZE + PROMPT_WHEEL_ITEM_GAP;
      const offset = e.nativeEvent.contentOffset.x;
      const index = Math.round(offset / stride);
      const clamped = Math.max(0, Math.min(prompts.length - 1, index));
      if (clamped !== currentIndex) {
        lastChangeFromWheel.current = true;
        snapToIndex(clamped);
      }
    },
    [prompts.length, currentIndex, snapToIndex]
  );

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handler = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Enter" && prompts[currentIndex]) {
        const cur = prompts[currentIndex];
        setSelectedId((id) => (id === cur.id ? null : cur.id));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex, prompts, goNext, goPrev]);

  return {
    imageUrl,
    prompts,
    loading,
    selectedId,
    currentIndex,
    isProcessing,
    wheelScrollRef,
    handleWheelScrollEnd,
    snapToIndex,
    goNext,
    goPrev,
    handleSelect,
    handleConfirm,
    getImageUri,
    getTitle,
    getEmoji,
  };
}
