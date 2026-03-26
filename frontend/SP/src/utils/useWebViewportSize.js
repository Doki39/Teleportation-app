import { useState, useEffect } from "react";
import { Platform, useWindowDimensions } from "react-native";

function readBrowserViewportSize() {
  if (typeof window === "undefined") return null;
  const vv = window.visualViewport;
  let w = window.innerWidth;
  let h = window.innerHeight;
  if (vv && vv.width > 0 && vv.height > 0) {
    w = Math.round(vv.width);
    h = Math.round(vv.height);
  }
  return { width: w, height: h };
}

export function useWebViewportSize() {
  const rn = useWindowDimensions();
  const [browser, setBrowser] = useState(() =>
    Platform.OS === "web" && typeof window !== "undefined" ? readBrowserViewportSize() : null
  );

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const sync = () => {
      const next = readBrowserViewportSize();
      if (!next) return;
      setBrowser((prev) => {
        if (!prev || prev.width !== next.width || prev.height !== next.height) {
          return next;
        }
        return prev;
      });
    };

    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);

    const poll = setInterval(sync, 100);
    const stopPoll = setTimeout(() => clearInterval(poll), 4000);

    return () => {
      clearInterval(poll);
      clearTimeout(stopPoll);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
    };
  }, []);

  if (Platform.OS !== "web") {
    return { width: rn.width, height: rn.height };
  }

  const bw = browser?.width ?? 0;
  const bh = browser?.height ?? 0;
  const width = Math.max(bw > 0 ? bw : rn.width, 1);
  const height = Math.max(bh > 0 ? bh : rn.height, 1);
  return { width, height };
}
