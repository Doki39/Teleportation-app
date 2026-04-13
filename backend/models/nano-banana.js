import { httpRequestText, httpRequestBuffer } from "../utils/httpNative.js";

const BASE_URL = "https://api.nanobananaapi.ai/api/v1/nanobanana";

async function generateImage(apiKey, imageUrl, prompt) {
  const payload = JSON.stringify({
    prompt,
    type: "IMAGETOIAMGE",
    imageUrls: imageUrl,
    numImages: 1,
    image_size: "16:9",
  });
  const { statusCode, bodyText } = await httpRequestText(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: payload,
  });

  let result;
  try {
    result = JSON.parse(bodyText);
  } catch {
    throw new Error(
      `NanoBanana generateImage non-JSON response (status ${statusCode}): ${bodyText.slice(0, 200)}`
    );
  }

  if (statusCode < 200 || statusCode >= 300 || result.code !== 200) {
    throw new Error(
      `NanoBanana generation failed (${result.code || statusCode}): ${result.msg || "Unknown error"}`
    );
  }
  return result.data.taskId;
}

async function getTaskStatus(apiKey, taskId) {
  const { statusCode, bodyText } = await httpRequestText(
    `${BASE_URL}/record-info?taskId=${encodeURIComponent(taskId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );
  try {
    return JSON.parse(bodyText);
  } catch {
    throw new Error(
      `NanoBanana getTaskStatus non-JSON response (status ${statusCode}): ${bodyText.slice(0, 200)}`
    );
  }
}

async function waitForCompletion(apiKey, taskId, maxWaitTime = 300000) {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const status = await getTaskStatus(apiKey, taskId);
    const data = status?.data;

    if (!data) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      continue;
    }

    switch (data.successFlag) {
      case 0:
        break;
      case 1:
        return data.response;
      case 2:
      case 3:
        throw new Error(data.errorMessage || "Generation failed");
      default:
        break;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  throw new Error("Generation timeout");
}

export async function generatePicture(imageUrl, modifyText) {
  const apiKey = process.env.NANOBANANA_API_KEY;
  if (!apiKey) {
    throw new Error("NANOBANANA_API_KEY is not set in environment");
  }

  const prompt = String(modifyText ?? "").trim();
  if (!prompt) {
    throw new Error("Prompt is empty");
  }
  const taskId = await generateImage(apiKey, imageUrl, prompt);

  const result = await waitForCompletion(apiKey, taskId);

  if (!result?.resultImageUrl) {
    throw new Error("NanoBanana did not return image URL");
  }

  const imageRes = await httpRequestBuffer(result.resultImageUrl);
  if (imageRes.statusCode < 200 || imageRes.statusCode >= 300) {
    throw new Error(`Failed to download NanoBanana image: ${imageRes.statusCode}`);
  }

  const outputBase64 = imageRes.body.toString("base64");

  if (!outputBase64) {
    throw new Error("Image generation did not return image data");
  }

  return outputBase64;
}
