export function throwFromFailedResponse(status, text) {
  const trimmed = (text || "").trim();
  if (trimmed) {
    try {
      const data = JSON.parse(trimmed);
      if (data?.message) {
        const err = new Error(String(data.message));
        if (data.code) err.code = data.code;
        throw err;
      }
      if (typeof data?.error === "string") {
        const err = new Error(data.error);
        if (data.code) err.code = data.code;
        throw err;
      }
    } catch (e) {
      if (!(e instanceof SyntaxError)) throw e;
    }
  }
  throw new Error(trimmed ? `${status}: ${trimmed}` : `Server responded with ${status}`);
}
