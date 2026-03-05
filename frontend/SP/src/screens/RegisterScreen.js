import { use, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, styles, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { commonStyles } from "../styles/commonStyles";
import { API_BASE_URL } from "../config/api";

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
      password
    });

    console.log(res.data); 

    if (res.data.token) {
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
    <View style={commonStyles.container}>
      <Text style={commonStyles.title}>Register</Text>
      <TextInput placeholder="First name" style={commonStyles.input} value={first_name} onChangeText={setFirst_name} />
      <TextInput placeholder="Last name" style={commonStyles.input} value={last_name} onChangeText={setLast_name} />
      <TextInput placeholder="Email" style={commonStyles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Phone number" style={commonStyles.input} value={phone_number} onChangeText={setPhone_number} />
      {error !== "" && <Text style={commonStyles.error}>{error}</Text>}
      <TextInput placeholder="Password" style={commonStyles.input} secureTextEntry={password} onChangeText={setPassword} />
      <TextInput placeholder="Confirm password" style={commonStyles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
      <TouchableOpacity style={commonStyles.button} onPress={handleRegistration}>
        <Text style={commonStyles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity style={commonStyles.button} onPress={() => navigation.replace("Login")} >
        <Text style={commonStyles.buttonText}>Already have an account?</Text>
      </TouchableOpacity>
      
    </View>
  );
}