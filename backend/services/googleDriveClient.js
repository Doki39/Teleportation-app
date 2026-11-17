import https from "node:https";
import { google } from "googleapis";

const httpsIpv4Agent = new https.Agent({ family: 4, keepAlive: true });

let drivePromise = null;

export function getDriveV3() {
  if (!drivePromise) {
    drivePromise = (async () => {
      const auth = new google.auth.GoogleAuth({
        scopes: "https://www.googleapis.com/auth/drive",
        transporterOptions: { agent: httpsIpv4Agent },
      });
      const authClient = await auth.getClient();
      return google.drive({ version: "v3", auth: authClient });
    })();
  }
  return drivePromise;
}
