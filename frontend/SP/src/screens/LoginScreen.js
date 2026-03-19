import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { commonStyles } from "../styles/commonStyles";
import { API_BASE_URL } from "../config/api";
import { ui } from "../theme/ui";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      console.log("Login response:", res.data);
      await AsyncStorage.setItem("token", res.data.token);
      navigation.replace("Home");
    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.message ||
        (data?.errors?.length ? data.errors.map((e) => e.msg).join("\n") : null) ||
        err.message ||
        "Something went wrong";
      Alert.alert("Login Failed", message);
    }
  };

  return (
    <View style={commonStyles.authScreen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} keyboardShouldPersistTaps="handled">
          <View style={commonStyles.authForm}>
            <Text style={commonStyles.authTitle}>Login</Text>

            <View style={commonStyles.authField}>
              <Text style={commonStyles.authLabel}>Email</Text>
              <TextInput
                placeholder="Email"
                placeholderTextColor={ui.colors.muted}
                style={commonStyles.authInput}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={commonStyles.authField}>
              <Text style={commonStyles.authLabel}>Password</Text>
              <TextInput
                placeholder="Password"
                placeholderTextColor={ui.colors.muted}
                style={commonStyles.authInput}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={commonStyles.authPrimaryButton} onPress={handleLogin}>
              <Text style={commonStyles.authPrimaryButtonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={commonStyles.authSecondaryButton} onPress={() => navigation.replace("Registration")}>
              <Text style={commonStyles.authSecondaryButtonText}>Don't have an account?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

