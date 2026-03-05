import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import RegistrationPage from "../screens/RegisterScreen";
import CarDetailsPage from "../screens/CarDetailsConfirmationScreen";
import UploadKeyPage from "../screens/UploadKeyScreen";
import LibraryScreen from "../screens/LibraryScreen";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Registration" component={RegistrationPage} />
      <Stack.Screen name="CarDetails" component={CarDetailsPage} />
      <Stack.Screen name="KeyScreen" component={UploadKeyPage} />
      <Stack.Screen name="Library" component={LibraryScreen} />
    </Stack.Navigator>
  );
}
