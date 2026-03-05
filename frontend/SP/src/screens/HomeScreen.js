import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { commonStyles } from "../styles/commonStyles";
import { openLibrary, openCamera, handlePhotoFlow} from "../utils/photoUtils";

export default function HomeScreen({ navigation }) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) setLoggedIn(true);
    };
    checkLogin();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setLoggedIn(false);
  };

  return (
   <View style={commonStyles.container}>
      {loggedIn ? (
        <View style={commonStyles.homeContent}>
          <TouchableOpacity style={commonStyles.cameraButton} onPress={() => handlePhotoFlow(openCamera,navigation)}>
            <Ionicons name="camera" size={50} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={commonStyles.button} onPress={() => handlePhotoFlow(openLibrary,navigation)}>
            <Text style={commonStyles.authText}>Upload from library</Text>
          </TouchableOpacity>
          <TouchableOpacity style={commonStyles.button} onPress={() => navigation.replace("Library")}>
            <Text style={commonStyles.authText}>Go to your library</Text>
          </TouchableOpacity>
          <TouchableOpacity style={commonStyles.authButton} onPress={handleLogout}>
            <Text style={commonStyles.authText}>Log out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={commonStyles.homeContent}>
          <TouchableOpacity
            style={commonStyles.button}
            onPress={() => navigation.replace("Login")}
          >
            <Text style={commonStyles.authText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={commonStyles.button}
            onPress={() => navigation.replace("Registration")} // registration  route changed for testing
          >
            <Text style={commonStyles.authText}>Register</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

