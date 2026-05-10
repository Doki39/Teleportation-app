import { google } from "googleapis";

let drivePromise = null;

export function getDriveV3() {
  if (!drivePromise) {
    drivePromise = (async () => {
      const auth = new google.auth.GoogleAuth({
        scopes: "https://www.googleapis.com/auth/drive",
      });
      const authClient = await auth.getClient();
      return google.drive({ version: "v3", auth: authClient });
    })();
  }
  return drivePromise;
}
