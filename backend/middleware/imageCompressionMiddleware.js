import sharp from "sharp";

const THREE_MB = 3 * 1024 * 1024;
const MAX_DIMENSION = 2048;
const MIN_DIMENSION = 1024;
const QUALITY_STEPS = [90, 85, 80, 75, 70, 65];

function isImageMime(mime) {
  return typeof mime === "string" && mime.startsWith("image/");
}

function baseResizedSharp(buffer, width, height) {
  const resizeOptions = {
    fit: "inside",
    withoutEnlargement: true,
    width: width > MAX_DIMENSION ? MAX_DIMENSION : width,
    height: height > MAX_DIMENSION ? MAX_DIMENSION : height,
  };
  return sharp(buffer).rotate().resize(resizeOptions);
}

async function compressToTarget(inputBuffer) {
  const meta = await sharp(inputBuffer).metadata();
  const sourceWidth = meta.width ?? MAX_DIMENSION;
  const sourceHeight = meta.height ?? MAX_DIMENSION;
  const useWebp = Boolean(meta.hasAlpha);

  let width = Math.min(sourceWidth, MAX_DIMENSION);
  let height = Math.min(sourceHeight, MAX_DIMENSION);
  let bestBuffer = inputBuffer;
  let bestMime = useWebp ? "image/webp" : "image/jpeg";
  let bestExt = useWebp ? ".webp" : ".jpg";

  while (true) {
    for (const quality of QUALITY_STEPS) {
      const pipeline = baseResizedSharp(inputBuffer, width, height);
      const output = useWebp
        ? await pipeline.webp({ quality }).toBuffer()
        : await pipeline.jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();

      if (output.length < bestBuffer.length) {
        bestBuffer = output;
      }
      if (output.length <= THREE_MB) {
        return { buffer: output, mimeType: bestMime, ext: bestExt };
      }
    }

    const nextWidth = Math.floor(width * 0.9);
    const nextHeight = Math.floor(height * 0.9);
    if (nextWidth < MIN_DIMENSION || nextHeight < MIN_DIMENSION) break;
    width = nextWidth;
    height = nextHeight;
  }

  return { buffer: bestBuffer, mimeType: bestMime, ext: bestExt };
}

export async function compressUploadIfNeeded(req, res, next) {
  try {
    if (!req.file?.buffer) return next();
    if (!isImageMime(req.file.mimetype)) return next();
    if (req.file.size <= THREE_MB) return next();

    const compressed = await compressToTarget(req.file.buffer);
    req.file.buffer = compressed.buffer;
    req.file.size = compressed.buffer.length;
    req.file.mimetype = compressed.mimeType;
    req.file.originalname = (req.file.originalname || "image").replace(/\.[^/.]+$/, "") + compressed.ext;

    return next();
  } catch (err) {
    return res.status(400).json({ message: err.message || "Image compression failed" });
  }
}
