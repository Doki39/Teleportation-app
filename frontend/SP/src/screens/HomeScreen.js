import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import ConnectedProfileMenuButton from "../components/ConnectedProfileMenuButton";
import RocketButton from "../components/RocketButton";
import BackgroundParticles from "../components/BackgroundParticles";
import SlideShow from "../components/SlideShow";
import { homeStyles } from "../styles/homeStyles";
import { ui } from "../theme/ui";
import { openLibrary, openCamera, handlePhotoFlow } from "../utils/photoUtils";
import { signOut, getStoredUser, isUserAdmin } from "../services/authServices";
import { fetchCurrentUser } from "../services/userServices";
import { USE_NATIVE_DRIVER } from "../utils/platformStyles";
import { getWebHomePortalScale, getWebHomeRocketScale, getWebHomeScale } from "../utils/webLayout";
import { useWebViewportSize } from "../utils/useWebViewportSize";

const ROCKET_SIZE = 118;

export default function HomeScreen({ navigation }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generationLimitModalVisible, setGenerationLimitModalVisible] = useState(false);
  const [generationLimitMessage, setGenerationLimitMessage] = useState("");
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

  const { width: windowWidth, height } = useWebViewportSize();
  const webHomeScale = getWebHomeScale(windowWidth, height);
  const rocketScale = getWebHomeRocketScale(windowWidth, height);
  const portalScale = getWebHomePortalScale(windowWidth, height);
  const needsWebScale = Platform.OS === "web" && webHomeScale < 1;
  const canvasW = needsWebScale ? windowWidth / webHomeScale : windowWidth;
  const canvasH = needsWebScale ? height / webHomeScale : height;

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) setLoggedIn(true);
      const u = await getStoredUser();
      setIsAdmin(isUserAdmin(u));
    };
    checkLogin();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setIsAdmin(false);
          return;
        }
        try {
          const u = await fetchCurrentUser();
          if (!cancelled) {
            setIsAdmin(isUserAdmin(u));
            await AsyncStorage.setItem("user", JSON.stringify(u));
          }
        } catch {
          const u = await getStoredUser();
          if (!cancelled) setIsAdmin(isUserAdmin(u));
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [loggedIn])
  );

  useEffect(() => {
    Animated.loop(
      Animated.timing(portalSpin, {
        toValue: 1,
        duration: 18000,
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    ).start();

    Animated.loop(
      Animated.timing(portalReverseSpin, {
        toValue: 1,
        duration: 9000,
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(portalPulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(portalPulse, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(portalDrift, {
          toValue: 1,
          duration: 3200,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(portalDrift, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    ).start();
  }, [portalDrift, portalPulse, portalReverseSpin, portalSpin]);

  const spin = portalSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const reverseSpin = portalReverseSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });
  const pulseScale = portalPulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });
  const pulseOpacity = portalPulse.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.55] });
  const driftX = portalDrift.interpolate({ inputRange: [0, 1], outputRange: [-12, 12] });

  const photoFlowOptions = {
    onUploadStart: () => setIsUploading(true),
    onUploadEnd: () => setIsUploading(false),
    onGenerationLimit: (message) => {
      setGenerationLimitMessage(typeof message === "string" ? message.trim() : "");
      setGenerationLimitModalVisible(true);
    },
  };

  const handleUpload = () => handlePhotoFlow(openLibrary, navigation, photoFlowOptions);
  const handleCamera = () => handlePhotoFlow(openCamera, navigation, photoFlowOptions);

  const BUTTONS_TOP = canvasH / 2 + ROCKET_SIZE / 2 + 24 + 40;

  const mainContent = (
    <>
      <BackgroundParticles width={canvasW} height={canvasH} />
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
      <Modal
        visible={generationLimitModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setGenerationLimitModalVisible(false);
          setGenerationLimitMessage("");
        }}
      >
        <View style={homeStyles.uploadOverlay}>
          <View style={[homeStyles.uploadCard, { maxWidth: 340 }]}>
            <View style={homeStyles.generationLimitIconWrap}>
              <Ionicons name="alert-circle" size={32} color={ui.colors.primary} />
            </View>
            <Text style={homeStyles.generationLimitTitle}>Maximum generations reached</Text>
            <Text style={homeStyles.generationLimitBody}>
              {generationLimitMessage ||
                "You have used all generations available for your account (3). Contact support if you need more."}
            </Text>
            <Pressable
              onPress={() => {
                setGenerationLimitModalVisible(false);
                navigation.navigate("ContactSupport");
              }}
              accessibilityRole="link"
              accessibilityLabel="Contact support"
            >
              <Text style={homeStyles.generationLimitSupportLink}>Contact support</Text>
            </Pressable>
            <Pressable
              style={homeStyles.generationLimitClose}
              onPress={() => {
                setGenerationLimitModalVisible(false);
                setGenerationLimitMessage("");
              }}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={homeStyles.generationLimitCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View style={[StyleSheet.absoluteFill, { zIndex: 1, pointerEvents: "none" }]}>
        <View style={[homeStyles.portalStage, portalScale !== 1 && { transform: [{ scale: portalScale }] }]}>
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

      <ConnectedProfileMenuButton showLogout={loggedIn} setLoggedIn={setLoggedIn} replaceToHomeOnLogout={false} />

      {loggedIn && (
        <View style={[homeStyles.homeRocketContainer, { pointerEvents: "box-none" }]}>
          <RocketButton onPress={handleCamera} baseScale={rocketScale} />
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
              {isAdmin && (
                <ActionButton
                  icon={<Ionicons name="construct-outline" size={20} color={ui.colors.secondary} />}
                  label="Admin panel"
                  onPress={() => navigation.navigate("AdminPanel")}
                  variant="secondary"
                />
              )}
        </View>
      )}

      <View style={[homeStyles.homeContentWrapper, { pointerEvents: loggedIn ? "box-none" : "auto" }]}>
        <View style={homeStyles.titleBlock}>
          <Text style={homeStyles.homeTitle}>Teleport</Text>
        </View>

        <SlideShow title="Where people went with us" />

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
      <Pressable
        style={homeStyles.homeFooter}
        onPress={() => navigation.navigate("ContactSupport")}
        accessibilityRole="link"
        accessibilityLabel="Contact support"
      >
        <Text style={homeStyles.homeFooterLink}>Contact support</Text>
      </Pressable>
    </>
  );

  return (
    <View style={homeStyles.homeRoot}>
      {needsWebScale ? (
        <View style={{ flex: 1, width: windowWidth, overflow: "hidden", alignItems: "center" }}>
          <View
            style={{
              width: canvasW,
              height: canvasH,
              transform: [{ scale: webHomeScale }],
              transformOrigin: "top center",
            }}
          >
            {mainContent}
          </View>
        </View>
      ) : (
        mainContent
      )}
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
      Animated.spring(scale, { toValue: toScale, useNativeDriver: USE_NATIVE_DRIVER, friction: 7, tension: 170 }),
      Animated.spring(lift, { toValue: toLift, useNativeDriver: USE_NATIVE_DRIVER, friction: 8, tension: 170 }),
      Animated.timing(glow, { toValue: toGlow, duration: 180, useNativeDriver: USE_NATIVE_DRIVER }),
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
          style={[
            homeStyles.actionGlow,
            { pointerEvents: "none" },
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
