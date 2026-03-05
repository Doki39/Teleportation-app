import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { commonStyles } from "../styles/commonStyles";
import { API_BASE_URL } from "../config/api";

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
    <View style={commonStyles.container}>
      <Text style={commonStyles.title}>Login page</Text>
      <TextInput placeholder="Email" style={commonStyles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" style={commonStyles.input} secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={commonStyles.button} onPress={handleLogin}>
        <Text style={commonStyles.buttonText}>Log In</Text>
      </TouchableOpacity>

    
      <TouchableOpacity style={commonStyles.button} onPress={() => navigation.replace("Registration")} >
        <Text style={commonStyles.buttonText}>Don't have an account?</Text>
      </TouchableOpacity>

    </View>
  );
}

