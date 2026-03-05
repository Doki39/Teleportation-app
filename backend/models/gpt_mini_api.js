import OpenAI from "openai";
import sharp from "sharp";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({ apiKey: process.env.API_KEY });

function cleanApiResponse(text) {
  return text.replace(/```json|```/g, "").trim();
}


export async function recognizeCarFromImage(buffer) {

const prompt = `
    Extract car information from the image.

    Return STRICT JSON in the following format:

    {
    "licensePlate": '',
    "country": '',
    "make": '',
    "model": '',
    "carColor": ''
    }

    Rules:
    - Return a SINGLE object!
    - Do not use arrays!
    - Every field must be a string.
    - If a field cannot be determined, return an empty string
    - Do NOT add explanations
    - Do NOT return anything outside the JSON
`;
 
  const jpegBuffer = await sharp(buffer)
    .resize({ width: 1280, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
    
  const base64Image = jpegBuffer.toString("base64");

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text", text: prompt},
          {
            type: "input_image",
            image_url: `data:image/jpeg;base64,${base64Image}`
          }
        ]
      }
    ],
  });
  const raw_response = response.output_text;
  const clean_response = cleanApiResponse(raw_response);
  
    return JSON.parse(clean_response);
}
