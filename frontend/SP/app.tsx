import { StatusBar } from "expo-status-bar";
import React from "react";
import AppStack from "./src/navigation/AppStack";

export default function App() {
  return (
    <>
      <AppStack />
      <StatusBar style="auto" />
    </>
  );
}
