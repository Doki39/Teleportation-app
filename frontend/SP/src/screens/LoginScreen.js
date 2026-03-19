import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { commonStyles } from "../styles/commonStyles";
import { ui } from "../theme/ui";
import { handleLogin } from "../services/authServices";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

            <TouchableOpacity style={commonStyles.authPrimaryButton} onPress={() => handleLogin({ email, password, navigation })}>
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

