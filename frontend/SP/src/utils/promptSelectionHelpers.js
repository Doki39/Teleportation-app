import { API_BASE_URL } from "../config/api";

export const PROMPT_CARD_WIDTH = 300;

export function resolvePromptImageUri(item) {
  const url = item?.image_url;
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}

export function getPortalGlowSize(promptCount) {
  const n = Math.max(promptCount, 1);
  if (promptCount <= 0) {
    return { width: 200 * 2.5, height: 200 * 1.2 };
  }
  const radius = PROMPT_CARD_WIDTH / (2 * Math.tan(Math.PI / n));
  return { width: radius * 2.5, height: radius * 1.2 };
}
