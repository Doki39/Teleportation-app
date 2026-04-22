import React from "react";
import { useNavigation } from "@react-navigation/native";
import ProfileMenuButton from "./ProfileMenuButton";
import { signOut } from "../services/authServices";

export default function ConnectedProfileMenuButton({
  showLogout = true,
  setLoggedIn,
  replaceToHomeOnLogout = true,
  headerLayout = false,
}) {
  const navigation = useNavigation();

  const onLogout = () => {
    if (replaceToHomeOnLogout) {
      signOut({ navigation, setLoggedIn });
    } else {
      signOut({ setLoggedIn });
    }
  };

  return <ProfileMenuButton showLogout={showLogout} onLogout={onLogout} headerLayout={headerLayout} />;
}
