import { StyleSheet } from "react-native";
import { centerContent } from "./bases";

export const libraryStyles = StyleSheet.create({
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
    ...centerContent,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
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
});
