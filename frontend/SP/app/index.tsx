import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform, View } from "react-native";
import AppStack from "../src/navigation/AppStack";

export default function App() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <AppStack />
      <StatusBar style="auto" />
    </View>
  );
}
