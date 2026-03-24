import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { promptStyles } from "../styles/promptStyles";
import { ui } from "../theme/ui";
import ProfileMenuButton from "../components/ProfileMenuButton";
import { signOut } from "../services/authServices";
import Cylinder3D from "../components/Cylinder3D";
import PromptThumbnailWheel from "../components/PromptThumbnailWheel";
import BackgroundParticles from "../components/BackgroundParticles";
import { usePromptSelectionScreen } from "../hooks/usePromptSelectionScreen";
import { getPortalGlowSize } from "../utils/promptSelectionHelpers";
import { goBackOrHome } from "../utils/navigationHelpers";
import { getWebCylinderScale } from "../utils/webLayout";

export default function PromptSelectionScreen({ route, navigation }) {
  const {
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
  } = usePromptSelectionScreen({ route, navigation });

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const cylinderScale = getWebCylinderScale(windowWidth, windowHeight);
  const glow = getPortalGlowSize(prompts.length);
  const current = prompts[currentIndex];

  return (
    <View style={promptStyles.promptScreen}>
      <ProfileMenuButton onLogout={() => signOut({ navigation })} />

      <View style={promptStyles.promptHeader}>
        <TouchableOpacity style={promptStyles.promptBackBtn} onPress={() => goBackOrHome(navigation)}>
          <Ionicons name="arrow-back" size={20} color={ui.colors.muted} />
        </TouchableOpacity>
        <View style={promptStyles.promptHeaderText}>
          <Text style={promptStyles.promptHeaderTitle}>Select Destination</Text>
          <Text style={promptStyles.promptHeaderSubtitle}>Spin the portal wheel to choose</Text>
        </View>
      </View>

      <BackgroundParticles width={windowWidth} height={windowHeight} />

      <View style={promptStyles.promptMainColumn}>
      <View style={promptStyles.promptCarouselWrap}>
        {prompts.length > 0 && (
          <View
            style={[
              promptStyles.promptPortalCarouselGlow,
              { width: glow.width, height: glow.height },
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
            getTitle={getTitle}
            getEmoji={getEmoji}
            webScale={cylinderScale}
          />
        )}

        {prompts.length > 0 && current && Platform.OS !== "web" && (
          <View style={promptStyles.promptDestInfo}>
            <Text
              style={[
                promptStyles.promptDestSubtitle,
                selectedId === current.id && promptStyles.promptDestSubtitleSelected,
              ]}
            >
              {selectedId === current.id
                ? "✓ Locked in — ready to teleport"
                : "Tap card or press Enter to select"}
            </Text>
          </View>
        )}

        {prompts.length > 0 && Platform.OS !== "web" && (
          <PromptThumbnailWheel
            prompts={prompts}
            screenWidth={windowWidth}
            scrollRef={wheelScrollRef}
            currentIndex={currentIndex}
            selectedId={selectedId}
            onPickIndex={snapToIndex}
            getImageUri={getImageUri}
            getEmoji={getEmoji}
            onScrollEnd={handleWheelScrollEnd}
          />
        )}
      </View>

      {prompts.length > 0 && Platform.OS === "web" && current && (
        <>
          <View style={promptStyles.promptDestInfoWeb}>
            <Text
              style={[
                promptStyles.promptDestSubtitle,
                { marginTop: 0 },
                selectedId === current.id && promptStyles.promptDestSubtitleSelected,
              ]}
            >
              {selectedId === current.id
                ? "✓ Locked in — ready to teleport"
                : "Tap card or press Enter to select"}
            </Text>
          </View>
          <View style={promptStyles.promptDotsWeb}>
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
        </>
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
              <Text
                style={[
                  promptStyles.promptConfirmBtnText,
                  !selectedId && promptStyles.promptConfirmBtnTextDisabled,
                ]}
              >
                Confirm Teleportation
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
