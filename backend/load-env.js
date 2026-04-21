import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const cred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (cred && !path.isAbsolute(cred)) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, cred);
}
