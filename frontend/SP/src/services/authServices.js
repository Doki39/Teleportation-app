
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";


// export const handleLogout = async () => {
//     await AsyncStorage.removeItem("token");
//     await AsyncStorage.removeItem("user");
//     setLoggedIn(false);
//   };

  

// export const handleRegistration = async () => {
//   setError("");

//   if (password.length < 8) {
//     setError("Password must be at least 8 characters");
//     return;
//   }

//   if (password !== confirmPassword) {
//     setError("Passwords do not match");
//     return;
//   }

//   try {
//     const res = await axios.post("http://192.168.1.196:3000/api/auth/register", {
//       first_name,
//       last_name,
//       email,
//       phone_number,
//       password
//     });

//     console.log(res.data); 

//     if (res.data.token) {
//       await AsyncStorage.setItem("token", res.data.token);
//       await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
//       navigation.replace("Home");
//     } else {
//       Alert.alert("Registration failed", res.data.message || "Something went wrong");
//     }
//   } catch (err) {
//     console.log(err.response?.data); 
//     Alert.alert("Registration failed", err.response?.data?.message || "Something went wrong");
//   }
// };


// const handleLogin = async () => {
//   try {
//     const res = await axios.post("http://192.168.1.196:3000/api/auth/login", { email, password });
//     console.log("Login response:", res.data);
//     await AsyncStorage.setItem("token", res.data.token);
//     navigation.replace("Home");
//   } catch (err) {
//     const data = err.response?.data;
//     const message =
//       data?.message ||
//       (data?.errors?.length ? data.errors.map((e) => e.msg).join("\n") : null) ||
//       err.message ||
//       "Something went wrong";
//     Alert.alert("Login Failed", message);
//   }
// };
