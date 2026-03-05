import { StyleSheet } from "react-native";


export const primaryBox = {
  borderWidth: 1,
  borderColor: "#ccc",
  padding: 10,
  marginVertical: 10,
};

export const primaryContainer = {
  padding: 20,
  flex: 1,
  justifyContent: "center",
};

export const primaryTitle = {
  fontSize: 28,
  marginBottom: 20,
  fontWeight: "bold",
};

export const commonStyles = StyleSheet.create({
  container: primaryContainer,
  title: primaryTitle,
  box: primaryBox,
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
  cameraButton: {
    width: 120,
    height: 120,
    backgroundColor: "#066ddb",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 20,
  },
  authButtons: {
    marginTop: 40,
    width: "70%",
    gap: 15,
  },
  authButton: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 8,
    marginTop: 12,
  },
  authText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  homeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  // Library / history screen styles
  libraryScreen: {
    flex: 1,
    backgroundColor: "#9EC8FF",
  },
  libraryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  libraryHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  libraryProfileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  libraryProfileInitial: {
    color: "#fff",
    fontWeight: "bold",
  },
  libraryListContent: {
    padding: 16,
  },
  libraryCard: {
    flexDirection: "row",
    backgroundColor: "#D9EFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  libraryCarImage: {
    width: 110,
    height: 110,
    borderRadius: 8,
    marginRight: 12,
  },
  libraryCardInfo: {
    flex: 1,
  },
  libraryLabel: {
    fontSize: 12,
    color: "#555",
  },
  libraryValue: {
    fontSize: 14,
    marginBottom: 4,
    backgroundColor: "#FFD4A3",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  libraryDetailsButton: {
    marginTop: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  libraryDetailsButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  libraryModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  libraryModalCard: {
    width: "85%",
    maxHeight: "80%",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
  },
  libraryModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  libraryModalTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: "bold",
  },
  libraryKeyImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  libraryNotesInput: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  libraryPrimaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  libraryPrimaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  librarySecondaryButton: {
    backgroundColor: "#005BBB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  librarySecondaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  libraryHistoryList: {
    marginTop: 8,
  },
  libraryHistoryItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  libraryHistoryDate: {
    fontSize: 12,
    fontWeight: "bold",
  },
  libraryHistoryText: {
    fontSize: 12,
  },
});

