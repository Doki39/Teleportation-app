import { API_BASE_URL } from "../config/api";


export async function getCarDetails() {
  const response = await fetch(`${API_BASE_URL}/api/vehicle`, {
    method: "GET",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }

  return response.json(); 
}


export async function updateCarNotes(licencePlate, notes, roomNumber) {
  const response = await fetch(`${API_BASE_URL}/api/vehicle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ licencePlate, notes, roomNumber }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server responded with ${response.status}: ${text}`);
  }

  return response.json();
}