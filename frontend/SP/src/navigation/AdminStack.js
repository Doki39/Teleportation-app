import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import PromptManagementScreen from "../screens/PromptManagementScreen";
import PromptCreateScreen from "../screens/PromptCreateScreen";
import ManageExistingPromptsScreen from "../screens/ManageExistingPromptsScreen";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminDashboard" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="PromptManagement" component={PromptManagementScreen} />
      <Stack.Screen name="PromptCreate" component={PromptCreateScreen} />
      <Stack.Screen name="ManageExistingPrompts" component={ManageExistingPromptsScreen} />
    </Stack.Navigator>
  );
}
