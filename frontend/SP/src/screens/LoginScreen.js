import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { authStyles } from "../styles/authStyles";
import { ui } from "../theme/ui";
import { handleLogin } from "../services/authServices";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onLogin = async () => {
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const result = await handleLogin({ email, password, navigation });
      if (!result.success && result.error) {
        setError(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

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
                editable={!submitting}
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
                editable={!submitting}
              />
            </View>

            {error !== "" && <Text style={authStyles.authError}>{error}</Text>}

            <TouchableOpacity
              style={[authStyles.authPrimaryButton, submitting && authStyles.authPrimaryButtonDisabled]}
              onPress={onLogin}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={authStyles.authPrimaryButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={authStyles.authSecondaryButton}
              onPress={() => navigation.replace("Registration")}
              disabled={submitting}
            >
              <Text style={authStyles.authSecondaryButtonText}>Don't have an account?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

