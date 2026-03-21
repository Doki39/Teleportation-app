import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Alert,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import ProfileButton from "../components/ProfileButton";
import RocketButton from "../components/RocketButton";
import BackgroundParticles from "../components/BackgroundParticles";
import { homeStyles } from "../styles/homeStyles";
import { ui } from "../theme/ui";
import { openLibrary, openCamera, handlePhotoFlow, buildImageUri } from "../utils/photoUtils";
import { getPhotosForSlide } from "../services/libraryServices";
import { handleLogout } from "../services/authServices";

const ROCKET_SIZE = 118;
const SLIDE_WIDTH = 330;
const SLIDE_HEIGHT = 186;
const SLIDE_BORDER_RADIUS = 20;
const SLIDE_ROTATE_MS = 3500;

export default function HomeScreen({ navigation }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [slidePhotos, setSlidePhotos] = useState([]);
  const [slideLoading, setSlideLoading] = useState(true);
  const slideListRef = useRef(null);
  const slideIndexRef = useRef(0);
  const portalSpin = useRef(new Animated.Value(0)).current;
  const portalReverseSpin = useRef(new Animated.Value(0)).current;
  const portalPulse = useRef(new Animated.Value(0)).current;
  const portalDrift = useRef(new Animated.Value(0)).current;
  const sparks = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      key: i,
      side: i % 2 === 0 ? "left" : "right",
      top: 80 + (i % 8) * 26,
      size: i % 3 === 0 ? 6 : 3,
      opacity: i % 3 === 0 ? 0.9 : 0.45,
    }));
  }, []);

  const { width: windowWidth, height } = Dimensions.get("window");

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) setLoggedIn(true);
    };
    checkLogin();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(portalSpin, {
        toValue: 1,
        duration: 18000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(portalReverseSpin, {
        toValue: 1,
        duration: 9000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(portalPulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(portalPulse, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(portalDrift, {
          toValue: 1,
          duration: 3200,
          useNativeDriver: true,
        }),
        Animated.timing(portalDrift, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [portalDrift, portalPulse, portalReverseSpin, portalSpin]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getPhotosForSlide();
        if (!cancelled) setSlidePhotos(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setSlidePhotos([]);
      } finally {
        if (!cancelled) setSlideLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slidePhotos.length <= 1) return undefined;
    const id = setInterval(() => {
      const next = (slideIndexRef.current + 1) % slidePhotos.length;
      slideIndexRef.current = next;
      slideListRef.current?.scrollToOffset({
        offset: next * SLIDE_WIDTH,
        animated: true,
      });
    }, SLIDE_ROTATE_MS);
    return () => clearInterval(id);
  }, [slidePhotos.length]);

  const renderSlideItem = useCallback(({ item }) => {
    const uri = buildImageUri(item);
    return (
      <View style={[homeStyles.slidePage, { width: SLIDE_WIDTH, height: SLIDE_HEIGHT }]}>
        {uri ? (
          <Image source={{ uri }} style={homeStyles.slideImage} resizeMode="cover" />
        ) : (
          <View style={[homeStyles.slideImage, { backgroundColor: "rgba(255,255,255,0.06)" }]} />
        )}
      </View>
    );
  }, []);

  const spin = portalSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const reverseSpin = portalReverseSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });
  const pulseScale = portalPulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });
  const pulseOpacity = portalPulse.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.55] });
  const driftX = portalDrift.interpolate({ inputRange: [0, 1], outputRange: [-12, 12] });

  const handleUpload = () =>
    handlePhotoFlow(openLibrary, navigation, {
      onUploadStart: () => setIsUploading(true),
      onUploadEnd: () => setIsUploading(false),
    });
  const handleCamera = () =>
    handlePhotoFlow(openCamera, navigation, {
      onUploadStart: () => setIsUploading(true),
      onUploadEnd: () => setIsUploading(false),
    });
  const onLogout = async () => {
    await handleLogout();
    setLoggedIn(false);
  };

  const BUTTONS_TOP = height / 2 + ROCKET_SIZE / 2 + 24;

  return (
    <View style={homeStyles.homeRoot}>
      <BackgroundParticles width={windowWidth} height={height} />
      {isUploading && (
        <Modal visible transparent animationType="fade">
          <View style={homeStyles.uploadOverlay}>
            <View style={homeStyles.uploadCard}>
              <ActivityIndicator size="large" color={ui.colors.primary} />
              <Text style={homeStyles.uploadText}>Uploading to cloud...</Text>
              <Text style={homeStyles.uploadSubtext}>Preparing your photo for teleportation</Text>
            </View>
          </View>
        </Modal>
      )}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 1 }]}>
        <View style={homeStyles.portalStage}>
          <Animated.View style={[homeStyles.portalAura, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />
          <Animated.View style={[homeStyles.portalMistLeft, { transform: [{ translateX: driftX }] }]} />
          <Animated.View style={[homeStyles.portalMistRight, { transform: [{ translateX: Animated.multiply(driftX, -1) }] }]} />

          {sparks.map((spark) => (
            <View
              key={spark.key}
              style={[
                homeStyles.spark,
                spark.side === "left" ? homeStyles.sparkLeft : homeStyles.sparkRight,
                {
                  top: spark.top,
                  width: spark.size,
                  height: spark.size,
                  opacity: spark.opacity,
                },
              ]}
            />
          ))}

          <Animated.View style={[homeStyles.portalRingWide, { transform: [{ rotate: spin }, { scale: pulseScale }] }]} />
          <Animated.View style={[homeStyles.portalRingOuter, { transform: [{ rotate: reverseSpin }] }]} />
          <Animated.View style={[homeStyles.portalRingInner, { transform: [{ rotate: spin }] }]} />
          <View style={homeStyles.portalCoreGlow} />
          <View style={homeStyles.portalCore} />
        </View>
      </View>

      <ProfileButton
        onPress={() => {
          Alert.alert("Not implemented", "Settings screen is not implemented yet.");
        }}
      />

      {loggedIn && (
        <View style={homeStyles.homeRocketContainer} pointerEvents="box-none">
          <RocketButton onPress={handleCamera} />
        </View>
      )}

      {loggedIn && (
        <View style={[homeStyles.buttonsWrap, { top: BUTTONS_TOP }]}>
              <ActionButton
                icon={<Ionicons name="cloud-upload-outline" size={20} color={ui.colors.primary} />}
                label="Upload from Library"
                onPress={handleUpload}
              />
              <ActionButton
                icon={<Ionicons name="images-outline" size={20} color={ui.colors.secondary} />}
                label="View Library"
                onPress={() => navigation.replace("Library")}
              />
              <ActionButton
                icon={<Ionicons name="add" size={20} color={ui.colors.secondary} />}
                label="Add Prompt"
                onPress={() => Alert.alert("Admin", "Add Prompt screen not implemented yet.")}
                variant="secondary"
              />
              <ActionButton
                icon={<Ionicons name="log-out-outline" size={20} color="#FCA5A5" />}
                label="Log Out"
                onPress={onLogout}
                variant="logout"
              />
        </View>
      )}

      <View style={homeStyles.homeContentWrapper} pointerEvents={loggedIn ? "box-none" : "auto"}>
        <View style={homeStyles.titleBlock}>
          <Text style={homeStyles.homeTitle}>Teleport</Text>
          <Text style={homeStyles.subtitle}>Be anywhere in seconds</Text>
        </View>

        <View style={[homeStyles.slideShowSection, { width: SLIDE_WIDTH }]}>
          <Text style={homeStyles.slideShowSectionTitle}>Where people went with us</Text>
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
            {slideLoading ? (
              <View style={[homeStyles.slideShowLoading, { width: SLIDE_WIDTH, height: SLIDE_HEIGHT }]}>
                <ActivityIndicator size="large" color={ui.colors.primary} />
              </View>
            ) : slidePhotos.length > 0 ? (
              <FlatList
                ref={slideListRef}
                data={slidePhotos}
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
                  slideIndexRef.current = Math.max(0, Math.min(idx, slidePhotos.length - 1));
                }}
                onScrollToIndexFailed={(info) => {
                  setTimeout(() => {
                    slideListRef.current?.scrollToOffset({
                      offset: info.index * SLIDE_WIDTH,
                      animated: true,
                    });
                  }, 300);
                }}
                renderItem={renderSlideItem}
              />
            ) : (
              <View style={[homeStyles.slideShowEmpty, { width: SLIDE_WIDTH, height: SLIDE_HEIGHT }]}>
                <Ionicons name="images-outline" size={36} color={ui.colors.muted} />
                <Text style={homeStyles.slideShowEmptyText}>No previews</Text>
              </View>
            )}
          </View>
        </View>

        {!loggedIn && (
          <>
            <View style={{ flex: 0.8 }} />
            <View style={homeStyles.guestWrap}>
              <Text style={homeStyles.guestTitle}>Login required</Text>
              <Text style={homeStyles.guestText}>You need to log in first to access camera, upload, and library features.</Text>

              <View style={homeStyles.secondaryWrap}>
              <ActionButton
                icon={<Ionicons name="log-in-outline" size={20} color={ui.colors.secondary} />}
                label="Log In"
                onPress={() => navigation.replace("Login")}
                variant="secondary"
              />
              <ActionButton
                icon={<Ionicons name="person-add-outline" size={20} color={ui.colors.primary} />}
                label="Register"
                onPress={() => navigation.replace("Registration")}
              />
              </View>
            </View>
            <View style={{ flex: 1 }} />
          </>
        )}
      </View>
    </View>
  );
}

function ActionButton({ icon, label, onPress, variant = "glass" }) {
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const hovered = useRef(false);

  const animateTo = (toScale, toLift, toGlow) => {
    Animated.parallel([
      Animated.spring(scale, { toValue: toScale, useNativeDriver: true, friction: 7, tension: 170 }),
      Animated.spring(lift, { toValue: toLift, useNativeDriver: true, friction: 8, tension: 170 }),
      Animated.timing(glow, { toValue: toGlow, duration: 180, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }, { translateY: lift }] }}>
      <Pressable
        onPress={onPress}
        onHoverIn={() => {
          hovered.current = true;
          animateTo(1.03, -4, 1);
        }}
        onHoverOut={() => {
          hovered.current = false;
          animateTo(1, 0, 0);
        }}
        onPressIn={() => animateTo(0.985, -2, 1)}
        onPressOut={() => {
          animateTo(hovered.current ? 1.03 : 1, hovered.current ? -4 : 0, hovered.current ? 1 : 0);
        }}
        style={({ pressed }) => [
          homeStyles.actionBtn,
          variant === "secondary" ? homeStyles.secondaryBtn : variant === "logout" ? homeStyles.logoutBtn : homeStyles.glassBtn,
          pressed && { opacity: 0.96 },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            homeStyles.actionGlow,
            variant === "secondary" ? homeStyles.secondaryGlow : variant === "logout" ? homeStyles.logoutGlow : homeStyles.primaryGlow,
            { opacity: glow },
          ]}
        />
        {icon}
        <Text
          style={[
            homeStyles.actionBtnText,
            variant === "secondary" && homeStyles.secondaryBtnText,
            variant === "logout" && homeStyles.logoutBtnText,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
