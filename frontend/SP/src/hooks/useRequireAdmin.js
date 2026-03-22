import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStoredUser, isUserAdmin } from "../services/authServices";
import { fetchCurrentUser } from "../services/userServices";

export function useRequireAdmin(navigation) {
  const [allowed, setAllowed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setAllowed(false);

      (async () => {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          navigation.replace("Home");
          return;
        }

        let user = null;
        try {
          user = await fetchCurrentUser();
          await AsyncStorage.setItem("user", JSON.stringify(user));
        } catch {
          user = await getStoredUser();
        }

        if (cancelled) return;

        if (!isUserAdmin(user)) {
          navigation.replace("Home");
          return;
        }

        setAllowed(true);
      })();

      return () => {
        cancelled = true;
      };
    }, [navigation])
  );

  return allowed;
}
