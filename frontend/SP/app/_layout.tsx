import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
