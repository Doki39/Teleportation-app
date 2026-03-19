import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  PanResponder,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useAnimatedRef,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ui } from "../theme/ui";

const CARD_WIDTH = 300;
const CARD_HEIGHT = 360;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

function ScanlineOverlay() {
  const lines = [];
  for (let i = 0; i < Math.ceil(CARD_HEIGHT / 4); i++) {
    lines.push(
      <View
        key={i}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: i * 4,
          height: 2,
          backgroundColor: "rgba(124,58,237,0.1)",
        }}
      />
    );
  }
  return <View style={StyleSheet.absoluteFill} pointerEvents="none">{lines}</View>;
}

export default function Cylinder3D({
  prompts,
  currentIndex,
  selectedId,
  onSelect,
  onSnapToIndex,
  getImageUri,
  getLabel,
  getEmoji,
  commonStyles,
}) {
  const COUNT = Math.max(prompts.length, 1);
  const ANGLE_STEP = 360 / COUNT;
  const radius = prompts.length > 1 ? CARD_WIDTH / (2 * Math.tan(Math.PI / COUNT)) : 150;

  const currentAngle = useSharedValue(-currentIndex * ANGLE_STEP);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);

  const updateIndex = useCallback(
    (angle) => {
      const idx = ((Math.round(-angle / ANGLE_STEP) % COUNT) + COUNT) % COUNT;
      onSnapToIndex(idx);
    },
    [COUNT, ANGLE_STEP, onSnapToIndex]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        dragStartX.current = evt.nativeEvent.pageX;
        dragStartAngle.current = currentAngle.value;
      },
      onPanResponderMove: (evt) => {
        const dx = evt.nativeEvent.pageX - dragStartX.current;
        currentAngle.value = dragStartAngle.current + dx * 0.3;
      },
      onPanResponderRelease: () => {
        const nearest = Math.round(currentAngle.value / ANGLE_STEP) * ANGLE_STEP;
        currentAngle.value = withSpring(nearest, { damping: 20, stiffness: 90 });
        setTimeout(() => updateIndex(nearest), 50);
      },
    })
  ).current;

  React.useEffect(() => {
    const target = -currentIndex * ANGLE_STEP;
    if (Math.abs(currentAngle.value - target) > 1) {
      currentAngle.value = withSpring(target, { damping: 20, stiffness: 90 });
    }
  }, [currentIndex, ANGLE_STEP]);

  const containerStyle = Platform.OS === "web"
    ? {
        perspective: 1400,
        width: CARD_WIDTH + 60,
        height: 380,
        transformStyle: "preserve-3d",
      }
    : {
        width: CARD_WIDTH + 60,
        height: 380,
      };

  if (prompts.length === 0) return null;

  const wrapperStyle = Platform.OS === "web"
    ? [styles.cylinderWrapper, containerStyle, { cursor: "grab", userSelect: "none" }]
    : [styles.cylinderWrapper, containerStyle];

  return (
    <View
      style={wrapperStyle}
      {...(Platform.OS === "web" ? panResponder.panHandlers : {})}
    >
      {Platform.OS === "web" ? (
        <WebCylinder
          prompts={prompts}
          currentAngle={currentAngle}
          currentIndex={currentIndex}
          selectedId={selectedId}
          onSelect={onSelect}
          onSnapToIndex={onSnapToIndex}
          getImageUri={getImageUri}
          getLabel={getLabel}
          getEmoji={getEmoji}
          ANGLE_STEP={ANGLE_STEP}
          radius={radius}
        />
      ) : (
        <NativeCarousel
          prompts={prompts}
          currentIndex={currentIndex}
          selectedId={selectedId}
          onSelect={onSelect}
          onSnapToIndex={onSnapToIndex}
          getImageUri={getImageUri}
          getLabel={getLabel}
          getEmoji={getEmoji}
          commonStyles={commonStyles}
        />
      )}
    </View>
  );
}

function WebCylinder({
  prompts,
  currentAngle,
  currentIndex,
  selectedId,
  onSelect,
  onSnapToIndex,
  getImageUri,
  getLabel,
  getEmoji,
  ANGLE_STEP,
  radius,
}) {
  const [angle, setAngle] = React.useState(-currentIndex * ANGLE_STEP);

  React.useEffect(() => {
    setAngle(-currentIndex * ANGLE_STEP);
  }, [currentIndex, ANGLE_STEP]);

  React.useEffect(() => {
    const id = setInterval(() => {
      setAngle((a) => (Math.abs(a - currentAngle.value) < 0.5 ? a : currentAngle.value));
    }, 16);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        width: CARD_WIDTH + 60,
        height: 380,
        position: "relative",
        perspective: 1200,
        perspectiveOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateY(${angle}deg)`,
          transition: "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
          transformOrigin: "center center",
        }}
      >
        {prompts.map((item, i) => {
          const cardAngle = i * ANGLE_STEP;
          const isFront = i === currentIndex;
          const isSelected = item.id === selectedId;
          const imageUri = getImageUri(item);

          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                marginLeft: -CARD_WIDTH / 2,
                marginTop: -CARD_HEIGHT / 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transformStyle: "preserve-3d",
                transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (isFront) {
                    onSelect(selectedId === item.id ? null : item.id);
                  } else {
                    onSnapToIndex(i);
                  }
                }}
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  borderRadius: 24,
                  overflow: "hidden",
                  border: isSelected && isFront ? `2px solid ${ui.colors.primary}` : "1px solid rgba(255,255,255,0.25)",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 0,
                  position: "relative",
                  boxShadow: isSelected && isFront ? `0 0 20px ${ui.colors.primary}` : "none",
                }}
              >
                {imageUri ? (
                  <img
                    src={imageUri}
                    alt={getLabel(item)}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "center",
                    }}
                    draggable={false}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      backgroundColor: ui.colors.glass,
                    }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(5,11,26,0.85) 0%, rgba(5,11,26,0.2) 40%, transparent 60%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.1,
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(124,58,237,0.1) 2px, rgba(124,58,237,0.1) 4px)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 16,
                  }}
                >
                  <span style={{ fontSize: 18, display: "block", marginBottom: 4 }}>{getEmoji(item)}</span>
                  <p style={{ fontSize: 14, fontWeight: "bold", color: ui.colors.text, margin: 0 }}>{getLabel(item)}</p>
                </div>
                {isSelected && isFront && (
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: ui.colors.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NativeCarouselCard({ item, index, scrollX, isSelected, isFront, onSelect, onSnapToIndex, getImageUri, getLabel, getEmoji, commonStyles }) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value - index * SCREEN_WIDTH);
    const scale = interpolate(distance, [0, SCREEN_WIDTH * 0.5], [1, 0.88], Extrapolation.CLAMP);
    const opacity = interpolate(distance, [0, SCREEN_WIDTH * 0.6], [1, 0.65], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity };
  });

  return (
    <Animated.View style={[{ width: SCREEN_WIDTH, alignItems: "center", justifyContent: "center" }, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (isFront) {
            onSelect(isSelected ? null : item.id);
          } else {
            onSnapToIndex(index);
          }
        }}
        style={[
          commonStyles.promptCard,
          isSelected && isFront && commonStyles.promptCardSelected,
        ]}
      >
        {getImageUri(item) ? (
          <Image source={{ uri: getImageUri(item) }} style={commonStyles.promptCardImage} resizeMode="contain" />
        ) : (
          <View style={[commonStyles.promptCardImage, { backgroundColor: ui.colors.glass }]} />
        )}
        <LinearGradient
          colors={["rgba(5,11,26,0.85)", "rgba(5,11,26,0.2)", "transparent"]}
          locations={[0, 0.4, 0.6]}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}>
          <ScanlineOverlay />
        </View>
        <View style={commonStyles.promptCardLabel}>
          <Text style={commonStyles.promptCardEmoji}>{getEmoji(item)}</Text>
          <Text style={commonStyles.promptCardTitle} numberOfLines={2}>{getLabel(item)}</Text>
        </View>
        {isSelected && isFront && (
          <View style={commonStyles.promptSelectedCheck}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

function NativeCarousel({
  prompts,
  currentIndex,
  selectedId,
  onSelect,
  onSnapToIndex,
  getImageUri,
  getLabel,
  getEmoji,
  commonStyles,
}) {
  const scrollRef = useAnimatedRef();
  const scrollX = useSharedValue(0);
  const isScrolling = useRef(false);

  React.useEffect(() => {
    if (scrollRef.current && !isScrolling.current) {
      scrollRef.current.scrollTo({ x: currentIndex * SCREEN_WIDTH, animated: true });
      scrollX.value = currentIndex * SCREEN_WIDTH;
    }
  }, [currentIndex]);

  const handleScroll = (e) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    if (index >= 0 && index < prompts.length && index !== currentIndex) {
      isScrolling.current = true;
      onSnapToIndex(index);
      setTimeout(() => { isScrolling.current = false; }, 100);
    }
  };

  const handleMomentumScrollEnd = (e) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    if (index >= 0 && index < prompts.length) onSnapToIndex(index);
    isScrolling.current = false;
  };

  return (
    <Animated.ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      scrollEventThrottle={16}
      scrollViewOffset={scrollX}
      contentContainerStyle={{ width: SCREEN_WIDTH * prompts.length }}
      style={{ width: SCREEN_WIDTH, flexGrow: 0 }}
    >
      {prompts.map((item, index) => (
        <NativeCarouselCard
          key={item.id}
          item={item}
          index={index}
          scrollX={scrollX}
          isSelected={item.id === selectedId}
          isFront={index === currentIndex}
          onSelect={onSelect}
          onSnapToIndex={onSnapToIndex}
          getImageUri={getImageUri}
          getLabel={getLabel}
          getEmoji={getEmoji}
          commonStyles={commonStyles}
        />
      ))}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  cylinderWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
});

