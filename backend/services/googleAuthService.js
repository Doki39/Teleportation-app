import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { access, writeFile } from "fs/promises";
import { constants as fsConstants } from "fs";
import os from "node:os";
import path from "path";
import { fileURLToPath } from "url";

const CREDENTIALS_PATH = path.join(os.tmpdir(), "teleport-google-credentials.json");
const LOCAL_CREDENTIALS_FILE = "teleportation-app-c7f4fbfab6d8.json";

export async function initGoogleCredentials() {
  const fromEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (fromEnv) {
    try {
      await access(fromEnv, fsConstants.F_OK);
      console.log(`[googleAuthService] Using GOOGLE_APPLICATION_CREDENTIALS=${fromEnv} (skipping S3).`);
      return;
    } catch {}
  }

  const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const localCredPath = path.join(backendRoot, LOCAL_CREDENTIALS_FILE);
  try {
    await access(localCredPath, fsConstants.F_OK);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = localCredPath;
    console.log(`[googleAuthService] Using local ${LOCAL_CREDENTIALS_FILE} (skipping S3).`);
    return;
  } catch {}

  const endpoint = process.env.AWS_ENDPOINT_URL || process.env.ENDPOINT;
  const region =
    process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || process.env.REGION || "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.SECRET_ACCESS_KEY;
  const bucket =
    process.env.AWS_GOOGLE_CREDENTIALS_BUCKET ||
    process.env.AWS_S3_BUCKET_NAME ||
    process.env.AWS_S3_BUCKET ||
    process.env.BUCKET;
  const objectKey =
    process.env.GOOGLE_CREDENTIALS_OBJECT_KEY || "teleportation-app-c7f4fbfab6d8.json";

  if (!bucket) {
    throw new Error(
      "initGoogleCredentials: set AWS_GOOGLE_CREDENTIALS_BUCKET or AWS_S3_BUCKET / AWS_S3_BUCKET_NAME / BUCKET"
    );
  }
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "initGoogleCredentials: set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (or ACCESS_KEY_ID and SECRET_ACCESS_KEY)"
    );
  }

  const clientConfig = {
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  };

  if (endpoint) {
    clientConfig.endpoint = endpoint;
    clientConfig.forcePathStyle = true;
  }

  const s3 = new S3Client(clientConfig);

  console.log(`[googleAuthService] Fetching credentials from s3://${bucket}/${objectKey} …`);

  const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: objectKey }));
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const credentialsJson = Buffer.concat(chunks).toString("utf-8");

  JSON.parse(credentialsJson);

  await writeFile(CREDENTIALS_PATH, credentialsJson, { mode: 0o600 });

  process.env.GOOGLE_APPLICATION_CREDENTIALS = CREDENTIALS_PATH;

  console.log(
    `[googleAuthService] Credentials written to ${CREDENTIALS_PATH} and GOOGLE_APPLICATION_CREDENTIALS set.`
  );
}

export { CREDENTIALS_PATH };
