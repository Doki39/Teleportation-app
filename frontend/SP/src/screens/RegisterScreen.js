import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { authStyles } from "../styles/authStyles";
import { ui } from "../theme/ui";
import { handleRegistration } from "../services/authServices";

export default function RegisterScreen({ navigation }) {
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const onRegister = async () => {
    setError("");
    const result = await handleRegistration({
      first_name,
      last_name,
      email,
      phone_number,
      password,
      confirmPassword,
      navigation,
    });
    if (!result.success && result.error) {
      setError(result.error);
    }
  };
  
  return (
    <View style={authStyles.authScreen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: 24 }} keyboardShouldPersistTaps="handled">
          <View style={authStyles.authForm}>
            <Text style={authStyles.authTitle}>Register</Text>

            <View style={authStyles.authField}>
              <Text style={authStyles.authLabel}>First name</Text>
              <TextInput
                placeholder="First name"
                placeholderTextColor={ui.colors.muted}
                style={authStyles.authInput}
                value={first_name}
                onChangeText={setFirst_name}
              />
            </View>

            <View style={authStyles.authField}>
              <Text style={authStyles.authLabel}>Last name</Text>
              <TextInput
                placeholder="Last name"
                placeholderTextColor={ui.colors.muted}
                style={authStyles.authInput}
                value={last_name}
                onChangeText={setLast_name}
              />
            </View>

            <View style={authStyles.authField}>
              <Text style={authStyles.authLabel}>Email</Text>
              <TextInput
                placeholder="Email"
                placeholderTextColor={ui.colors.muted}
                style={authStyles.authInput}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={authStyles.authField}>
              <Text style={authStyles.authLabel}>Phone number</Text>
              <TextInput
                placeholder="Phone number"
                placeholderTextColor={ui.colors.muted}
                style={authStyles.authInput}
                value={phone_number}
                onChangeText={setPhone_number}
                keyboardType="phone-pad"
              />
            </View>

            {error !== "" && <Text style={authStyles.authError}>{error}</Text>}

            <View style={authStyles.authField}>
              <Text style={authStyles.authLabel}>Password</Text>
              <TextInput
                placeholder="Password (min 8 characters)"
                placeholderTextColor={ui.colors.muted}
                style={authStyles.authInput}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={authStyles.authField}>
              <Text style={authStyles.authLabel}>Confirm password</Text>
              <TextInput
                placeholder="Confirm password"
                placeholderTextColor={ui.colors.muted}
                style={authStyles.authInput}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity style={authStyles.authPrimaryButton} onPress={onRegister}>
              <Text style={authStyles.authPrimaryButtonText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity style={authStyles.authSecondaryButton} onPress={() => navigation.replace("Login")}>
              <Text style={authStyles.authSecondaryButtonText}>Already have an account?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}