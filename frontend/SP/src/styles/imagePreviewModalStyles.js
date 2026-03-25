import { StyleSheet } from "react-native";
import { ui } from "../theme/ui";

export const IMAGE_PREVIEW_MODAL_TOOLBAR_GAP = 12;

export const imagePreviewModalStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "rgba(5,11,26,0.92)",
    alignItems: "center",
  },
  card: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    zIndex: 1,
    minHeight: 0,
  },
  imageWrap: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    borderRadius: 16,
    backgroundColor: ui.colors.glass,
    borderWidth: 1,
    borderColor: ui.colors.glassBorder,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: IMAGE_PREVIEW_MODAL_TOOLBAR_GAP,
    flexShrink: 0,
    flexGrow: 0,
  },
  toolBtn: {
    backgroundColor: ui.colors.glass,
  },
  toolbarActions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 12,
    minWidth: 0,
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: ui.colors.glass,
    borderWidth: 1,
    borderColor: ui.colors.glassBorder,
    minWidth: 0,
  },
  shareBtnText: {
    color: ui.colors.muted,
    fontWeight: "600",
    fontSize: 15,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },
  actionBtnBusy: {
    opacity: 0.85,
  },
});
