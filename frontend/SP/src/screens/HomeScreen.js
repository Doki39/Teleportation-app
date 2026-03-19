import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Alert,
  Dimensions,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import ProfileButton from "../components/ProfileButton";
import RocketButton from "../components/RocketButton";
import { commonStyles } from "../styles/commonStyles";
import { ui } from "../theme/ui";
import { openLibrary, openCamera, handlePhotoFlow } from "../utils/photoUtils";

export default function HomeScreen({ navigation }) {
  const [loggedIn, setLoggedIn] = useState(false);
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

  const spin = portalSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const reverseSpin = portalReverseSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });
  const pulseScale = portalPulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });
  const pulseOpacity = portalPulse.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.55] });
  const driftX = portalDrift.interpolate({ inputRange: [0, 1], outputRange: [-12, 12] });

  const handleUpload = () => handlePhotoFlow(openLibrary, navigation);
  const handleCamera = () => handlePhotoFlow(openCamera, navigation);
  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    setLoggedIn(false);
  };

  const { height } = Dimensions.get("window");
  const ROCKET_SIZE = 118;
  const BUTTONS_TOP = height / 2 + ROCKET_SIZE / 2 + 24;

  return (
    <View style={commonStyles.homeRoot}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={commonStyles.portalStage}>
          <Animated.View style={[commonStyles.portalAura, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />
          <Animated.View style={[commonStyles.portalMistLeft, { transform: [{ translateX: driftX }] }]} />
          <Animated.View style={[commonStyles.portalMistRight, { transform: [{ translateX: Animated.multiply(driftX, -1) }] }]} />

          {sparks.map((spark) => (
            <View
              key={spark.key}
              style={[
                commonStyles.spark,
                spark.side === "left" ? commonStyles.sparkLeft : commonStyles.sparkRight,
                {
                  top: spark.top,
                  width: spark.size,
                  height: spark.size,
                  opacity: spark.opacity,
                },
              ]}
            />
          ))}

          <Animated.View style={[commonStyles.portalRingWide, { transform: [{ rotate: spin }, { scale: pulseScale }] }]} />
          <Animated.View style={[commonStyles.portalRingOuter, { transform: [{ rotate: reverseSpin }] }]} />
          <Animated.View style={[commonStyles.portalRingInner, { transform: [{ rotate: spin }] }]} />
          <View style={commonStyles.portalCoreGlow} />
          <View style={commonStyles.portalCore} />
        </View>
      </View>

      <ProfileButton
        onPress={() => {
          Alert.alert("Not implemented", "Settings screen is not implemented yet.");
        }}
      />

      {loggedIn && (
        <View style={commonStyles.homeRocketContainer} pointerEvents="box-none">
          <RocketButton onPress={handleCamera} />
        </View>
      )}

      {loggedIn && (
        <View style={[commonStyles.buttonsWrap, { top: BUTTONS_TOP }]}>
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
                onPress={handleLogout}
                variant="logout"
              />
        </View>
      )}

      <View style={commonStyles.homeContentWrapper} pointerEvents={loggedIn ? "box-none" : "auto"}>
        <View style={commonStyles.titleBlock}>
          <Text style={commonStyles.homeTitle}>Teleport</Text>
          <Text style={commonStyles.subtitle}>Be anywhere in seconds</Text>
        </View>

        {!loggedIn && (
          <View style={commonStyles.guestWrap}>
            <Text style={commonStyles.guestTitle}>Login required</Text>
            <Text style={commonStyles.guestText}>You need to log in first to access camera, upload, and library features.</Text>

            <View style={commonStyles.secondaryWrap}>
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
          commonStyles.actionBtn,
          variant === "secondary" ? commonStyles.secondaryBtn : variant === "logout" ? commonStyles.logoutBtn : commonStyles.glassBtn,
          pressed && { opacity: 0.96 },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            commonStyles.actionGlow,
            variant === "secondary" ? commonStyles.secondaryGlow : variant === "logout" ? commonStyles.logoutGlow : commonStyles.primaryGlow,
            { opacity: glow },
          ]}
        />
        {icon}
        <Text
          style={[
            commonStyles.actionBtnText,
            variant === "secondary" && commonStyles.secondaryBtnText,
            variant === "logout" && commonStyles.logoutBtnText,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
