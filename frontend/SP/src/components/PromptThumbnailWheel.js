import React from "react";
import { View, ScrollView, TouchableOpacity, Image, Text } from "react-native";
import {
  promptStyles,
  PROMPT_WHEEL_ITEM_GAP,
  PROMPT_WHEEL_ITEM_SIZE,
} from "../styles/promptStyles";

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
  return (
    <View style={promptStyles.promptScrollWheelWrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
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
              (screenWidth - PROMPT_WHEEL_ITEM_SIZE - PROMPT_WHEEL_ITEM_GAP) / 2,
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
              onPress={() => onPickIndex(i)}
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
  );
}
