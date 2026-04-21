import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform, View } from "react-native";
import AppStack from "../src/navigation/AppStack";
import SouProgramHeaderLogo from "../src/components/SouProgramHeaderLogo";

const WEB_VIEWPORT_RELOAD_KEY = "__sp_web_viewport_reload_once";

export default function App() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    let mayReload = false;
    try {
      if (sessionStorage.getItem(WEB_VIEWPORT_RELOAD_KEY)) {
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
        });
        return;
      }
      sessionStorage.setItem(WEB_VIEWPORT_RELOAD_KEY, "1");
      mayReload = true;
    } catch {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
      return;
    }

    if (!mayReload) return;

    const reload = () => {
      window.location.reload();
    };

    if (document.readyState === "complete") {
      window.setTimeout(reload, 0);
    } else {
      window.addEventListener("load", () => window.setTimeout(reload, 0), { once: true });
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <AppStack />
      <SouProgramHeaderLogo />
      <StatusBar style="auto" />
    </View>
  );
}
