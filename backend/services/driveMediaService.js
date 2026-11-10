import { getDriveV3 } from "./googleDriveClient.js";

export async function pipeDriveFileToResponse(fileId, res) {
  const drive = await getDriveV3();

  const meta = await drive.files.get({
    fileId,
    fields: "mimeType",
    supportsAllDrives: true,
  });
  const mime = meta.data.mimeType || "image/jpeg";

  const fileRes = await drive.files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "stream" }
  );

  res.setHeader("Content-Type", mime);
  res.setHeader("Cache-Control", "public, max-age=86400");

  fileRes.data.on("error", (err) => {
    if (!res.headersSent) {
      res.status(500).json({ message: err.message || "Stream error" });
    }
  });

  fileRes.data.pipe(res);
}
