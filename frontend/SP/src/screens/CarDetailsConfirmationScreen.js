import React, {  useRef, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, Button, Alert } from "react-native";
import { commonStyles, primaryBox, primaryTitle} from "../styles/commonStyles"

export default function CarDetails({ route, navigation }) {
  const { carData, imageUrl } = route.params ?? {};


  const [licensePlate, setLicensePlate] = useState(carData?.licensePlate ?? "");
  const [country, setCountry] = useState(carData?.country ?? "");
  const [model, setModel] = useState(carData?.model ?? "");
  const [make, setMake] = useState(carData?.make ?? "");
  const [carColor, setCarColor] = useState(carData?.carColor ?? "");

  const [roomNumber, setRoomNumber] = useState("");
  
  const [note, setNote] = useState("");

  

  const licensePlateRef = useRef(null);
  const countryRef = useRef(null);
  const modelRef = useRef(null);
  const makeRef = useRef(null);
  const carColorRef = useRef(null);

  const handleConfirm = () => {
    const data = {
      licensePlate,
      country,
      model,
      make,
      carColor,
      imageUrl: imageUrl ?? null,
      roomNumber: roomNumber || null,
      note: note || null,
    };
    if (!licensePlate?.trim()) {
      Alert.alert("Error", "License plate is required");
      return;
    }
    navigation.replace("KeyScreen", { data });
  };
    return (
    <View style={{ padding: 20 }}>
      <Text>License Plate</Text>

      <TextInput
        ref={licensePlateRef}
        value={licensePlate}
        onChangeText={setLicensePlate}
        placeholder="Enter license plate"
        style={primaryBox}
      />

      <TextInput
        ref={countryRef}
        value={country}
        onChangeText={setCountry}
        placeholder="Enter country"
        style={primaryBox}
    />

        <TextInput
        ref={makeRef}
        value={make}
        onChangeText={setMake}
        placeholder="Enter car make"
        style={primaryBox}
    />

        <TextInput
        ref={modelRef}
        value={model}
        onChange={setModel}
        placeholder="Enter car model"
        style={primaryBox}
    />

        <TextInput
        ref={carColorRef}
        value={carColor}
        onChange={setCarColor}
        placeholder="Car color"
        style={primaryBox}
    />

        <TextInput
        value={roomNumber}
        onChangeText={setRoomNumber}
        placeholder="Guest room number"
        style={primaryBox}
    />
            <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Notes ( guest last name,preferences )"
        style={primaryBox}
    />

      <Button title="Confirm" onPress={handleConfirm} />
    </View>
  );
}
