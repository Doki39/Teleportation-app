import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getGeneratedPhotos } from "../services/libraryServices";
import { API_BASE_URL } from "../config/api";
import { commonStyles } from "../styles/commonStyles";

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

  return (
    <View style={commonStyles.libraryScreen}>
      <View style={commonStyles.libraryHeader}>
        <TouchableOpacity onPress={() => navigation.replace("Home")}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={commonStyles.libraryHeaderTitle}>Library</Text>
        <View style={commonStyles.libraryProfileCircle}>
          <Text style={commonStyles.libraryProfileInitial}>D</Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={commonStyles.libraryListContent}
        data={photos}
        keyExtractor={(item, index) => String(item.id ?? index)}
        numColumns={2}
        renderItem={({ item }) => {
          const imageUri = `${API_BASE_URL}${item.processed_uri}`;

          return (
            <View style={commonStyles.libraryCard}>
              <Image
                source={{ uri: imageUri }}
                style={commonStyles.libraryCarImage}
                resizeMode="cover"
              />
            </View>
          );
        }}
      />
    </View>
  );
}