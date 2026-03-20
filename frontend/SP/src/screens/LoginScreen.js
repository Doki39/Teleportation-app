import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { authStyles } from "../styles/authStyles";
import { ui } from "../theme/ui";
import { handleLogin } from "../services/authServices";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={authStyles.authScreen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} keyboardShouldPersistTaps="handled">
          <View style={authStyles.authForm}>
            <Text style={authStyles.authTitle}>Login</Text>

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
              <Text style={authStyles.authLabel}>Password</Text>
              <TextInput
                placeholder="Password"
                placeholderTextColor={ui.colors.muted}
                style={authStyles.authInput}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={authStyles.authPrimaryButton} onPress={() => handleLogin({ email, password, navigation })}>
              <Text style={authStyles.authPrimaryButtonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={authStyles.authSecondaryButton} onPress={() => navigation.replace("Registration")}>
              <Text style={authStyles.authSecondaryButtonText}>Don't have an account?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

