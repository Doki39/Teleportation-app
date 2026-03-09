import dotenv from "dotenv";

dotenv.config();

class NanoBananaAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.nanobananaapi.ai/api/v1/nanobanana";
  }

  async generateImage(imageUrl, prompt) {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
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
        `NanoBanana generateImage non-JSON response (status ${response.status}): ${text.slice(0,200)}`
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
  
  async getTaskStatus(taskId) {
    const response = await fetch(`${this.baseUrl}/record-info?taskId=${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        `NanoBanana getTaskStatus non-JSON response (status ${response.status}): ${text.slice(
          0,
          200
        )}`
      );
    }
  }
  
  async waitForCompletion(taskId, maxWaitTime = 300000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getTaskStatus(taskId);
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
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    throw new Error("Generation timeout");
  }
}

export async function generatePicture(imageUrl, prompt) {
  const apiKey = process.env.NANOBANANA_API_KEY;
  if (!apiKey) {
    throw new Error("NANOBANANA_API_KEY is not set in environment");
  }

  const callbackUrl = process.env.NANOBANANA_CALLBACK_URL;
  if (!callbackUrl) {
    throw new Error("NANOBANANA_CALLBACK_URL is not set in environment");
  }

  const api = new NanoBananaAPI(apiKey);

  const taskId = await api.generateImage(imageUrl, prompt); // 

  const result = await api.waitForCompletion(taskId);

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

