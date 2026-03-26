import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform, View } from "react-native";
import AppStack from "../src/navigation/AppStack";

function nudgeWebViewport() {
  if (typeof window === "undefined") return;
  window.scrollTo(0, 0);
  window.dispatchEvent(new Event("resize"));
}

export default function App() {
  useEffect(() => {
    if (Platform.OS !== "web") return;

    requestAnimationFrame(() => {
      requestAnimationFrame(nudgeWebViewport);
    });
    const t1 = setTimeout(nudgeWebViewport, 50);
    const t2 = setTimeout(nudgeWebViewport, 250);

    window.addEventListener("orientationchange", nudgeWebViewport);

    const vv = window.visualViewport;
    let vvTimer: ReturnType<typeof setTimeout> | null = null;
    const onVvResize = () => {
      if (vvTimer) clearTimeout(vvTimer);
      vvTimer = setTimeout(nudgeWebViewport, 100);
    };
    vv?.addEventListener("resize", onVvResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (vvTimer) clearTimeout(vvTimer);
      window.removeEventListener("orientationchange", nudgeWebViewport);
      vv?.removeEventListener("resize", onVvResize);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <AppStack />
      <StatusBar style="auto" />
    </View>
  );
}
