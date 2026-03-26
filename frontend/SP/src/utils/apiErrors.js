function normalizeResponseData(data) {
  if (data == null) return null;
  if (typeof data === "string") {
    const t = data.trim();
    if (!t) return null;
    try {
      return JSON.parse(t);
    } catch {
      return { message: t };
    }
  }
  if (typeof data === "object") return data;
  return null;
}

function collectValidatorMessages(errors, out) {
  if (!Array.isArray(errors)) return;
  for (const e of errors) {
    if (e == null) continue;
    if (e.nestedErrors?.length) collectValidatorMessages(e.nestedErrors, out);
    let m = e.msg ?? e.message;
    if (typeof m === "function") {
      try {
        m = m();
      } catch {
        m = null;
      }
    }
    if (m != null && String(m).trim()) out.push(String(m).trim());
  }
}

export function formatApiResponseBody(data) {
  const parsed = normalizeResponseData(data);
  if (!parsed) return null;
  const lines = [];
  collectValidatorMessages(parsed.errors, lines);
  if (lines.length) return [...new Set(lines)].join("\n");
  if (parsed.message != null && String(parsed.message).trim()) return String(parsed.message).trim();
  return null;
}

export function formatAxiosError(err) {
  const fromBody = formatApiResponseBody(err?.response?.data);
  if (fromBody) return fromBody;
  if (err?.message) return err.message;
  return "Something went wrong";
}

export function validateProfileForm({ first_name, last_name, email, phone_number }) {
  const fn = String(first_name ?? "").trim();
  const ln = String(last_name ?? "").trim();
  const em = String(email ?? "").trim();
  const phone = String(phone_number ?? "").trim();

  if (!fn) return { ok: false, error: "First name is required" };
  if (!ln) return { ok: false, error: "Last name is required" };
  if (!em) return { ok: false, error: "Email is required" };

  const emailSimple = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailSimple.test(em)) {
    return { ok: false, error: "Enter a valid email address" };
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) {
    return { ok: false, error: "Phone number must contain at least 8 digits" };
  }

  return { ok: true };
}
