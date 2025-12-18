
import { GoogleGenAI, Type } from "@google/genai";
import { SocialPlatform, ToneType, GenerationResult, Language } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSocialContent = async (
  mediaParts: { data: string; mimeType: string }[],
  platform: SocialPlatform,
  tone: ToneType,
  language: Language
): Promise<GenerationResult> => {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Analyze these ${mediaParts.length} material(s) from a daily life context.
    1. Identify the core theme or main items across all provided materials.
    2. Write a highly engaging social media caption for ${platform} in ${language}.
    3. The tone must be ${tone}.
    4. Follow these guidelines:
       - Default tone is "human oral" - speak like a real person sharing with friends.
       - Language of output: ${language}.
       - Use platform-specific styles (Rednote: many emojis, helpful tips; TikTok: punchy, hook-first; Instagram: aesthetic, brief).
       - Ensure compliance (safe for all audiences, positive, no offensive content).
       - Suggest relevant hashtags in ${language}.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        ...mediaParts.map(m => ({
          inlineData: {
            data: m.data,
            mimeType: m.mimeType,
          },
        })),
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
            description: "The main item or theme identified in the materials.",
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
