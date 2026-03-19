import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { commonStyles } from "../styles/commonStyles";
import { API_BASE_URL } from "../config/api";
import { ui } from "../theme/ui";

export default function RegisterScreen({ navigation }) {
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegistration = async () => {
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        first_name,
        last_name,
        email,
        phone_number,
        password,
      });

      console.log(res.data);

      if (res.data.token && res.data.user) {
        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
        navigation.replace("Home");
      } else {
        Alert.alert("Registration failed", res.data.message || "Something went wrong");
      }
    } catch (err) {
      console.log(err.response?.data);
      Alert.alert("Registration failed", err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <View style={commonStyles.authScreen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: 24 }} keyboardShouldPersistTaps="handled">
          <View style={commonStyles.authForm}>
            <Text style={commonStyles.authTitle}>Register</Text>

            <View style={commonStyles.authField}>
              <Text style={commonStyles.authLabel}>First name</Text>
              <TextInput
                placeholder="First name"
                placeholderTextColor={ui.colors.muted}
                style={commonStyles.authInput}
                value={first_name}
                onChangeText={setFirst_name}
              />
            </View>

            <View style={commonStyles.authField}>
              <Text style={commonStyles.authLabel}>Last name</Text>
              <TextInput
                placeholder="Last name"
                placeholderTextColor={ui.colors.muted}
                style={commonStyles.authInput}
                value={last_name}
                onChangeText={setLast_name}
              />
            </View>

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
              <Text style={commonStyles.authLabel}>Phone number</Text>
              <TextInput
                placeholder="Phone number"
                placeholderTextColor={ui.colors.muted}
                style={commonStyles.authInput}
                value={phone_number}
                onChangeText={setPhone_number}
                keyboardType="phone-pad"
              />
            </View>

            {error !== "" && <Text style={commonStyles.authError}>{error}</Text>}

            <View style={commonStyles.authField}>
              <Text style={commonStyles.authLabel}>Password</Text>
              <TextInput
                placeholder="Password (min 8 characters)"
                placeholderTextColor={ui.colors.muted}
                style={commonStyles.authInput}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={commonStyles.authField}>
              <Text style={commonStyles.authLabel}>Confirm password</Text>
              <TextInput
                placeholder="Confirm password"
                placeholderTextColor={ui.colors.muted}
                style={commonStyles.authInput}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity style={commonStyles.authPrimaryButton} onPress={handleRegistration}>
              <Text style={commonStyles.authPrimaryButtonText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity style={commonStyles.authSecondaryButton} onPress={() => navigation.replace("Login")}>
              <Text style={commonStyles.authSecondaryButtonText}>Already have an account?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}