import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import BackgroundParticles, {
  BACKGROUND_PARTICLES_SOFT_DOT,
} from "../components/BackgroundParticles";
import { Ionicons } from "@expo/vector-icons";
import { getGeneratedPhotos } from "../services/libraryServices";
import { API_BASE_URL } from "../config/api";
import { libraryStyles } from "../styles/libraryStyles";

export default function LibraryScreen({ navigation }) {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getGeneratedPhotos();
        setPhotos(data);
      } catch (err) {
        Alert.alert("Error", err.message || "Failed to load pictures");
      }
    })();
  }, []);

  const { width: libraryW, height: libraryH } = Dimensions.get("window");

  return (
    <View style={libraryStyles.libraryScreen}>
      <BackgroundParticles
        width={libraryW}
        height={libraryH}
        dotColor={BACKGROUND_PARTICLES_SOFT_DOT}
      />
      <View style={libraryStyles.libraryHeader}>
        <TouchableOpacity onPress={() => navigation.replace("Home")}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={libraryStyles.libraryHeaderTitle}>Library</Text>
        <View style={libraryStyles.libraryProfileCircle}>
          <Text style={libraryStyles.libraryProfileInitial}>D</Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={libraryStyles.libraryListContent}
        data={photos}
        keyExtractor={(item, index) => String(item.id ?? index)}
        numColumns={2}
        renderItem={({ item }) => {
          const imageUri = `${API_BASE_URL}${item.processed_uri}`;

          return (
            <View style={libraryStyles.libraryCard}>
              <Image
                source={{ uri: imageUri }}
                style={libraryStyles.libraryCarImage}
                resizeMode="cover"
              />
            </View>
          );
        }}
      />
    </View>
  );
}