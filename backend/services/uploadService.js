import { google } from "googleapis";
import { Readable } from "stream";

export async function uploadImage(file) {
  const folderId = process.env.DRIVE_UPLOAD_FOLDER_ID

  const auth = new google.auth.GoogleAuth({
    scopes: "https://www.googleapis.com/auth/drive",
  });
  const authClient = await auth.getClient();
  const service = google.drive({ version: "v3", auth: authClient });

  const requestBody = {
    name: file.originalname || "photo.jpg",
    parents: [folderId],
  };
  const media = {
    mimeType: file.mimetype || "image/jpeg",
    body: Readable.from(Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer)),
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

    return `https://drive.google.com/uc?id=${fileId}`;
  } catch (err) {
    if (err?.code === 403 && err?.message?.includes("storage quota")) {
      throw new Error(
        "Drive 403: Service accounts have no storage. You must use a Shared Drive (not a regular folder). See backend/DRIVE_SETUP.md for exact steps."
      );
    }
    throw err;
  }
}