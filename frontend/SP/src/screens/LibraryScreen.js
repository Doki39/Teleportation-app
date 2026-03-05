import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCarDetails, updateCarNotes } from "../services/libraryServices";
import { API_BASE_URL } from "../config/api";
import { commonStyles } from "../styles/commonStyles";

const latestPerPlate = (rows) => {
  const latestByPlate = {};
  rows.forEach((car) => {
    const plate = car.licence_plate || "UNKNOWN";
    const existing = latestByPlate[plate];
    if (!existing) {
      latestByPlate[plate] = car;
    } else {
      const existingDate = new Date(existing.created_at);
      const currentDate = new Date(car.created_at);
      if (currentDate > existingDate) {
        latestByPlate[plate] = car;
      }
    }
  });
  return Object.values(latestByPlate);
};

export default function LibraryScreen({ navigation }) {
  const [allCars, setAllCars] = useState([]);
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [roomDraft, setRoomDraft] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCarDetails();
        setAllCars(data);
        setCars(latestPerPlate(data));
      } catch (err) {
        Alert.alert("Error", err.message || "Failed to load cars");
      }
    })();
  }, []);

  const openDetails = (car) => {
    setSelectedCar(car);
    setNotesDraft(car.notes ?? "");
    setRoomDraft(car.room_number ? String(car.room_number) : "");
    setShowHistory(false);
  };

  const closeDetails = () => {
    setSelectedCar(null);
    setNotesDraft("");
    setRoomDraft("");
    setShowHistory(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedCar) return;
    try {
      await updateCarNotes(selectedCar.licence_plate, notesDraft, roomDraft);
      setAllCars((prev) =>
        prev.map((car) =>
          car.licence_plate === selectedCar.licence_plate
            ? { ...car, notes: notesDraft, room_number: roomDraft || null }
            : car
        )
      );
      setCars((prev) =>
        prev.map((car) =>
          car.licence_plate === selectedCar.licence_plate
            ? { ...car, notes: notesDraft, room_number: roomDraft || null }
            : car
        )
      );
      closeDetails();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to save notes");
    }
  };

  return (
    <View style={commonStyles.libraryScreen}>
      <View style={commonStyles.libraryHeader}>
        <TouchableOpacity onPress={() => navigation.replace("Home")}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={commonStyles.libraryHeaderTitle}>History</Text>
        <TouchableOpacity style={commonStyles.libraryProfileCircle}>
          <Text style={commonStyles.libraryProfileInitial}>D</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={commonStyles.libraryListContent}
        data={cars}
        keyExtractor={(item, index) => String(item.licence_plate ?? index)}
        renderItem={({ item }) => {
          const imageUri = `${API_BASE_URL}${item.image_url}`;

          return (
            <View style={commonStyles.libraryCard}>
              <Image
                source={{ uri: imageUri }}
                style={commonStyles.libraryCarImage}
                resizeMode="contain"
              />

              <View style={commonStyles.libraryCardInfo}>
                <Text style={commonStyles.libraryLabel}>Make</Text>
                <Text style={commonStyles.libraryValue}>{item.make || "-"}</Text>

                <Text style={commonStyles.libraryLabel}>Plate</Text>
                <Text style={commonStyles.libraryValue}>
                  {item.licence_plate || "-"}
                </Text>

                <Text style={commonStyles.libraryLabel}>Country</Text>
                <Text style={commonStyles.libraryValue}>
                  {item.country || "-"}
                </Text>

                <Text style={commonStyles.libraryLabel}>Room number</Text>
                <Text style={commonStyles.libraryValue}>
                  {item.room_number || "-"}
                </Text>

                <TouchableOpacity
                  style={commonStyles.libraryDetailsButton}
                  onPress={() => openDetails(item)}
                >
                  <Text style={commonStyles.libraryDetailsButtonText}>
                    Details
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <Modal
        visible={!!selectedCar}
        transparent
        animationType="fade"
        onRequestClose={closeDetails}
      >
        <View style={commonStyles.libraryModalBackdrop}>
          <View style={commonStyles.libraryModalCard}>
            <View style={commonStyles.libraryModalHeader}>
              <TouchableOpacity onPress={closeDetails}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={commonStyles.libraryModalTitle}>Details</Text>
            </View>

            {selectedCar && (
              <View>
                {selectedCar.key_url && (
                  <Image
                    source={{ uri: `${API_BASE_URL}${selectedCar.key_url}` }}
                    style={commonStyles.libraryKeyImage}
                    resizeMode="contain"
                  />
                )}

                <Text style={commonStyles.libraryLabel}>Make</Text>
                <Text style={commonStyles.libraryValue}>
                  {selectedCar.make || "-"}
                </Text>

                <Text style={commonStyles.libraryLabel}>Plate</Text>
                <Text style={commonStyles.libraryValue}>
                  {selectedCar.licence_plate || "-"}
                </Text>

                <Text style={commonStyles.libraryLabel}>Country</Text>
                <Text style={commonStyles.libraryValue}>
                  {selectedCar.country || "-"}
                </Text>

                <Text style={commonStyles.libraryLabel}>Color</Text>
                <Text style={commonStyles.libraryValue}>
                  {selectedCar.color || "-"}
                </Text>

                <Text style={commonStyles.libraryLabel}>Room number</Text>
                <TextInput
                  value={roomDraft}
                  onChangeText={setRoomDraft}
                  placeholder="Room number"
                  style={commonStyles.libraryNotesInput}
                />

                <Text style={commonStyles.libraryLabel}>Parked by (notes)</Text>
                <TextInput
                  value={notesDraft}
                  onChangeText={setNotesDraft}
                  placeholder="Type notes here"
                  style={commonStyles.libraryNotesInput}
                  multiline
                />

                <TouchableOpacity
                  style={commonStyles.libraryPrimaryButton}
                  onPress={handleSaveNotes}
                >
                  <Text style={commonStyles.libraryPrimaryButtonText}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={commonStyles.librarySecondaryButton}
                  onPress={() => setShowHistory((prev) => !prev)}
                >
                  <Text style={commonStyles.librarySecondaryButtonText}>
                    Car parking history
                  </Text>
                </TouchableOpacity>

                {showHistory && (
                  <View style={commonStyles.libraryHistoryList}>
                    {allCars
                      .filter(
                        (car) =>
                          car.licence_plate === selectedCar.licence_plate
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.created_at) - new Date(a.created_at)
                      )
                      .map((entry) => (
                        <View
                          key={`${entry.licence_plate}-${entry.created_at}`}
                          style={commonStyles.libraryHistoryItem}
                        >
                          <Text style={commonStyles.libraryHistoryDate}>
                            {new Date(entry.created_at).toLocaleString()}
                          </Text>
                          <Text style={commonStyles.libraryHistoryText}>
                            Parking: {entry.parking || "-"}
                          </Text>
                          <Text style={commonStyles.libraryHistoryText}>
                            Room: {entry.room_number || "-"}
                          </Text>
                          <Text style={commonStyles.libraryHistoryText}>
                            Notes: {entry.notes || "-"}
                          </Text>
                          <Image
                source={{ uri: entry.imageUri }}
                style={commonStyles.libraryCarImage}
                resizeMode="contain"
              />
                        </View>
                      ))}
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}