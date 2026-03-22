import React, { useMemo } from "react";
import {
  View,
  Pressable,
  Image,
  Text,
  Platform,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  promptStyles,
  PROMPT_WHEEL_ITEM_GAP,
  PROMPT_WHEEL_ITEM_SIZE,
} from "../styles/promptStyles";
import { getThumbnailWheelEdgePad } from "../utils/promptSelectionHelpers";

const ITEM_STRIDE = PROMPT_WHEEL_ITEM_SIZE + PROMPT_WHEEL_ITEM_GAP;

export default function PromptThumbnailWheel({
  prompts,
  screenWidth,
  scrollRef,
  currentIndex,
  selectedId,
  onPickIndex,
  getImageUri,
  getEmoji,
  onScrollEnd,
}) {
  const edgePad = getThumbnailWheelEdgePad(screenWidth);

  const contentMinWidth = useMemo(() => {
    const n = Math.max(prompts.length, 1);
    return edgePad * 2 + n * ITEM_STRIDE;
  }, [edgePad, prompts.length]);

  return (
    <View style={promptStyles.promptScrollWheelWrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        snapToInterval={ITEM_STRIDE}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        keyboardShouldPersistTaps="handled"
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        contentContainerStyle={[
          promptStyles.promptScrollWheelContent,
          {
            paddingLeft: edgePad,
            paddingRight: edgePad,
            minWidth: contentMinWidth,
          },
        ]}
        style={promptStyles.promptScrollWheel}
      >
        {prompts.map((p, i) => {
          const uri = getImageUri(p);
          const isActive = i === currentIndex;
          return (
            <Pressable
              key={p.id}
              delayPressIn={Platform.OS === "android" ? 350 : 280}
              onPress={() => onPickIndex(i)}
              style={({ pressed }) => [
                promptStyles.promptScrollWheelItem,
                isActive && promptStyles.promptScrollWheelItemActive,
                selectedId === p.id &&
                  i !== currentIndex &&
                  promptStyles.promptScrollWheelItemSelected,
                pressed && { opacity: 0.85 },
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
              {uri ? (
                <View style={promptStyles.promptScrollWheelEmojiBadge}>
                  <Text style={promptStyles.promptScrollWheelEmojiBadgeText}>
                    {getEmoji(p)}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
