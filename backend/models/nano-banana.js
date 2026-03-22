import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "https://api.nanobananaapi.ai/api/v1/nanobanana";

const STATIC_IMAGE_RULES = `

Use the reference image as the base composition.

Preserve: 
- subject identity and facial features (STRICT)
- subject pose
- camera angle
- general lighting

Ensure:
- realistic perspective and scale
- natural shadows and lighting
- photorealistic travel photo

STRICT PRESERVE:
- subject identity must remain exactly the same
- do not change face, facial features, or expression
- do not alter skin tone, hairstyle, or facial structure
- keep original face details exactly as in the reference image
- no beautification, no stylization, no face retouching`;

function buildNanoBananaPrompt(modifyText) {
  const modify = String(modifyText ?? "").trim();
  if (!modify) {
    throw new Error("Modify prompt from database is empty");
  }
  return `${STATIC_IMAGE_RULES}\n\nModify:\n${modify}`;
}

async function generateImage(apiKey, imageUrl, prompt) {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      type: "IMAGETOIAMGE",
      imageUrls: imageUrl,
      numImages: 1,
      image_size: "16:9",
    }),
  });

  const text = await response.text();
  let result;

  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(
      `NanoBanana generateImage non-JSON response (status ${response.status}): ${text.slice(0, 200)}`
    );
  }

  if (!response.ok || result.code !== 200) {
    throw new Error(
      `NanoBanana generation failed (${result.code || response.status}): ${
        result.msg || "Unknown error"
      }`
    );
  }
  return result.data.taskId;
}

async function getTaskStatus(apiKey, taskId) {
  const response = await fetch(`${BASE_URL}/record-info?taskId=${taskId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `NanoBanana getTaskStatus non-JSON response (status ${response.status}): ${text.slice(0,200)}`
    );
  }
}

async function waitForCompletion(apiKey, taskId, maxWaitTime = 300000) {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const status = await getTaskStatus(apiKey, taskId);
    const data = status?.data;

    if (!data) {
      console.log("NanoBanana getTaskStatus response missing data:", status);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      continue;
    }

    switch (data.successFlag) {
      case 0:
        console.log("Task is generating...");
        break;
      case 1:
        console.log("Generation completed successfully!");
        return data.response;
      case 2:
      case 3:
        throw new Error(data.errorMessage || "Generation failed");
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

  const callbackUrl = process.env.NANOBANANA_CALLBACK_URL;
  if (!callbackUrl) {
    throw new Error("NANOBANANA_CALLBACK_URL is not set in environment");
  }

  const prompt = buildNanoBananaPrompt(modifyText);
  const taskId = await generateImage(apiKey, imageUrl, prompt);

  const result = await waitForCompletion(apiKey, taskId);

  if (!result?.resultImageUrl) {
    throw new Error("NanoBanana did not return image URL");
  }

  const imageResponse = await fetch(result.resultImageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download NanoBanana image: ${imageResponse.status}`);
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const outputBase64 = Buffer.from(arrayBuffer).toString("base64");

  if (!outputBase64) {
    throw new Error("Image generation did not return image data");
  }

  return outputBase64;
}