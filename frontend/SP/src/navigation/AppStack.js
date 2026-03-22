import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import RegistrationPage from "../screens/RegisterScreen";
import LibraryScreen from "../screens/LibraryScreen";
import PromptSelectionScreen from "../screens/PromptSelectionScreen";
import SettingsScreen from "../screens/SettingsScreen";
import PromptManagementScreen from "../screens/PromptManagementScreen";
import PromptCreateScreen from "../screens/PromptCreateScreen";
import ManageExistingPromptsScreen from "../screens/ManageExistingPromptsScreen";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Registration" component={RegistrationPage} options={{ headerShown: false }} />
      <Stack.Screen name="Library" component={LibraryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PromptSelection" component={PromptSelectionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PromptManagement" component={PromptManagementScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PromptCreate" component={PromptCreateScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ManageExistingPrompts" component={ManageExistingPromptsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
