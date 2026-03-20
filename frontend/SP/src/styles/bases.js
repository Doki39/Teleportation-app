import { ui } from "../theme/ui";

/** Plain style fragments — compose inside feature `StyleSheet.create` */
export const flexCenter = { flex: 1, justifyContent: "center", alignItems: "center" };
export const centerContent = { alignItems: "center", justifyContent: "center" };
export const glassBorder = { borderWidth: 1, borderColor: ui.colors.glassBorder };
export const iconButtonBase = {
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
};
export const textMuted = { color: ui.colors.muted, fontSize: 14 };
export const textBold = { color: ui.colors.text, fontWeight: "600" };
