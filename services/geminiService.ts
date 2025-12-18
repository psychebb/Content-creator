
import { GoogleGenAI, Type } from "@google/genai";
import { SocialPlatform, ToneType, GenerationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateSocialContent = async (
  base64Data: string,
  mimeType: string,
  platform: SocialPlatform,
  tone: ToneType
): Promise<GenerationResult> => {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Analyze this material from a daily life context.
    1. Identify the main item or subject of the photo/video.
    2. Write a highly engaging social media caption for ${platform}.
    3. The tone should be ${tone}.
    4. Follow these guidelines:
       - Default tone is "human oral" - speak like a real person sharing with friends.
       - Use platform-specific styles (Rednote: many emojis, helpful tips; TikTok: punchy, hook-first; Instagram: aesthetic, brief).
       - Ensure compliance (safe for all audiences, positive, no offensive content).
       - Suggest relevant hashtags.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          identifiedItem: {
            type: Type.STRING,
            description: "The main item identified in the photo/video.",
          },
          caption: {
            type: Type.STRING,
            description: "The generated social media caption.",
          },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of suggested hashtags.",
          },
        },
        required: ["identifiedItem", "caption", "hashtags"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No content generated");
  
  return JSON.parse(text) as GenerationResult;
};
