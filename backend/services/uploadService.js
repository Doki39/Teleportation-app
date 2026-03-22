import { google } from "googleapis";
import { Readable } from "stream";

export async function uploadBufferToDrive(buffer, { filename = "image.jpg", mimeType = "image/jpeg" } = {}) {
  const folderId = process.env.DRIVE_UPLOAD_FOLDER_ID;
  if (!folderId) {
    throw new Error("DRIVE_UPLOAD_FOLDER_ID is not set");
  }

  const auth = new google.auth.GoogleAuth({
    scopes: "https://www.googleapis.com/auth/drive",
  });
  const authClient = await auth.getClient();
  const service = google.drive({ version: "v3", auth: authClient });

  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const requestBody = {
    name: filename,
    parents: [folderId],
  };
  const media = {
    mimeType,
    body: Readable.from(buf),
  };

  try {
    const uploaded = await service.files.create({
      requestBody,
      media,
      fields: "id",
      supportsAllDrives: true,
    });

    const fileId = uploaded.data.id;

    await service.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
      supportsAllDrives: true,
    });

    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } catch (err) {
    if (err?.code === 403 && err?.message?.includes("storage quota")) {
      throw new Error(
        "Drive 403: Service accounts have no storage. You must use a Shared Drive (not a regular folder). See backend/DRIVE_SETUP.md for exact steps."
      );
    }
    throw err;
  }
}

export async function uploadImage(file) {
  return uploadBufferToDrive(file.buffer, {
    filename: file.originalname || "photo.jpg",
    mimeType: file.mimetype || "image/jpeg",
  });
}