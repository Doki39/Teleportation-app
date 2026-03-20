const MAX_TITLE_LENGTH = 50;

export function getPromptDisplayTitle(item) {
  const raw = String(item?.title ?? "").trim();
  if (!raw) return "Destination";
  return raw.length > MAX_TITLE_LENGTH ? `${raw.slice(0, MAX_TITLE_LENGTH)}…` : raw;
}
