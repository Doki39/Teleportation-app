import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, useWindowDimensions, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackgroundParticles from "../components/BackgroundParticles";
import HeaderBackButton from "../components/HeaderBackButton";
import { libraryStyles } from "../styles/libraryStyles";
import { promptStyles } from "../styles/promptStyles";
import { authStyles } from "../styles/authStyles";
import { ui } from "../theme/ui";
import { goBackOrHome } from "../utils/navigationHelpers";
import { fetchCurrentUser, updateCurrentUser, formatApiError } from "../services/userServices";

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
};

function formFromUser(user) {
  if (!user) return { ...emptyForm };
  return {
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    email: user.email ?? "",
    phone_number: user.phone_number ?? "",
  };
}

export default function SettingsScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const [form, setForm] = useState(emptyForm);
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const successTimerRef = useRef(null);

  const showSuccessBanner = useCallback((message) => {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }
    setSuccessMessage(message);
    successTimerRef.current = setTimeout(() => {
      setSuccessMessage(null);
      successTimerRef.current = null;
    }, 4500);
  }, []);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const loadProfile = useCallback(async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      setNeedsLogin(true);
      setForm(emptyForm);
      setCurrentPassword("");
      setLoading(false);
      return;
    }
    setNeedsLogin(false);

    let hasCache = false;
    try {
      const raw = await AsyncStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u && (u.email || u.uid)) {
          setForm(formFromUser(u));
          hasCache = true;
        }
      }
    } catch {
    }

    if (!hasCache) {
      setLoading(true);
    } else {
      setLoading(false);
    }

    try {
      const user = await fetchCurrentUser();
      setForm(formFromUser(user));
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } catch (err) {
      if (err.response?.status === 401) {
        setNeedsLogin(true);
        setForm(emptyForm);
      } else if (!hasCache) {
        Alert.alert("Could not load profile", formatApiError(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onSave = async () => {
    if (needsLogin) {
      navigation.navigate("Login");
      return;
    }
    const pwd = currentPassword.trim();
    if (!pwd) {
      Alert.alert("Password required", "Enter your current password to save changes.");
      return;
    }
    setSaving(true);
    try {
      await updateCurrentUser({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        current_password: pwd,
      });
      setCurrentPassword("");
      showSuccessBanner("Successfully updated — your settings have been saved.");
    } catch (err) {
      if (err.response?.status === 401) {
        Alert.alert("Session expired", "Please log in again.", [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
      } else if (err.response?.status === 403) {
        Alert.alert("Could not save", formatApiError(err));
      } else {
        Alert.alert("Could not save", formatApiError(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const showForm = !needsLogin && !loading;

  return (
    <View style={libraryStyles.libraryScreen}>
      <BackgroundParticles width={width} height={height} />

      <View style={promptStyles.promptHeader}>
        <HeaderBackButton onPress={() => goBackOrHome(navigation)} />
        <View style={promptStyles.promptHeaderText}>
          <Text style={promptStyles.promptHeaderTitle}>Settings</Text>
          <Text style={promptStyles.promptHeaderSubtitle}>Profile & account</Text>
        </View>
        <View style={promptStyles.promptBackBtn}>
          <Ionicons name="settings" size={20} color={ui.colors.primary} />
        </View>
      </View>

      {showForm && successMessage ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginHorizontal: 24,
            marginBottom: 8,
            marginTop: 4,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(34, 197, 94, 0.55)",
            backgroundColor: "rgba(34, 197, 94, 0.12)",
            ...(Platform.OS === "android"
              ? { elevation: 3 }
              : Platform.OS === "ios"
                ? {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                  }
                : {}),
          }}
          accessibilityLiveRegion="polite"
        >
          <Ionicons name="checkmark-circle" size={22} color="#4ADE80" style={{ marginRight: 10 }} />
          <Text style={{ color: "#DCFCE7", fontSize: 15, flex: 1, lineHeight: 20 }}>{successMessage}</Text>
          <TouchableOpacity
            onPress={() => {
              if (successTimerRef.current) clearTimeout(successTimerRef.current);
              setSuccessMessage(null);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Dismiss success message"
          >
            <Ionicons name="close" size={20} color={ui.colors.muted} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 32,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {loading && !needsLogin ? (
            <View style={{ paddingVertical: 48, alignItems: "center" }}>
              <ActivityIndicator size="large" color={ui.colors.primary} />
              <Text style={{ color: ui.colors.muted, marginTop: 12 }}>Loading profile from server…</Text>
            </View>
          ) : null}

          {needsLogin ? (
            <View style={{ gap: 16 }}>
              <Text style={{ color: ui.colors.text, fontSize: 16, lineHeight: 24 }}>
                Log in to view and edit your profile.
              </Text>
              <TouchableOpacity
                style={authStyles.authPrimaryButton}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={authStyles.authPrimaryButtonText}>Log in</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {showForm ? (
            <>
              <View style={authStyles.authField}>
                <Text style={authStyles.authLabel}>First name</Text>
                <TextInput
                  placeholder="First name"
                  placeholderTextColor={ui.colors.muted}
                  style={authStyles.authInput}
                  value={form.first_name}
                  onChangeText={(t) => setField("first_name", t)}
                  editable={!saving}
                  autoCapitalize="words"
                />
              </View>
              <View style={[authStyles.authField, { marginTop: 16 }]}>
                <Text style={authStyles.authLabel}>Last name</Text>
                <TextInput
                  placeholder="Last name"
                  placeholderTextColor={ui.colors.muted}
                  style={authStyles.authInput}
                  value={form.last_name}
                  onChangeText={(t) => setField("last_name", t)}
                  editable={!saving}
                  autoCapitalize="words"
                />
              </View>
              <View style={[authStyles.authField, { marginTop: 16 }]}>
                <Text style={authStyles.authLabel}>Email</Text>
                <TextInput
                  placeholder="Email"
                  placeholderTextColor={ui.colors.muted}
                  style={authStyles.authInput}
                  value={form.email}
                  onChangeText={(t) => setField("email", t)}
                  editable={!saving}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={[authStyles.authField, { marginTop: 16 }]}>
                <Text style={authStyles.authLabel}>Phone</Text>
                <TextInput
                  placeholder="Phone number"
                  placeholderTextColor={ui.colors.muted}
                  style={authStyles.authInput}
                  value={form.phone_number}
                  onChangeText={(t) => setField("phone_number", t)}
                  editable={!saving}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={[authStyles.authField, { marginTop: 24 }]}>
                <Text style={authStyles.authLabel}>Current password</Text>
                <Text style={{ color: ui.colors.muted, fontSize: 12, marginBottom: 8 }}>
                  Required to save changes to your profile.
                </Text>
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor={ui.colors.muted}
                  style={authStyles.authInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  editable={!saving}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[authStyles.authPrimaryButton, { marginTop: 24, opacity: saving ? 0.7 : 1 }]}
                onPress={onSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={authStyles.authPrimaryButtonText}>Save changes</Text>
                )}
              </TouchableOpacity>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
