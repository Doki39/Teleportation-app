import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import { Stack } from "expo-router";

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
