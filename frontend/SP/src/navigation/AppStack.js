import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import RegistrationPage from "../screens/RegisterScreen";
import LibraryScreen from "../screens/LibraryScreen";
import PromptSelectionScreen from "../screens/PromptSelectionScreen"
const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Registration" component={RegistrationPage} />
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen name="PromptSelection" component={PromptSelectionScreen} />
    </Stack.Navigator>
  );
}
