import { GoogleGenAI, Type } from "@google/genai";
import { GardenPlan, GardenPreferences } from '../types';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Constants for Models
const TEXT_MODEL = 'gemini-3-flash-preview';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

export const generateGardenPlan = async (prefs: GardenPreferences): Promise<GardenPlan> => {
  const prompt = `
    Create a detailed garden design plan for a ${prefs.size} area with a ${prefs.style} style.
    The climate context is: ${prefs.climate}.
    User specifically wants these features: ${prefs.features.join(', ')}.
    Additional notes: ${prefs.description}.
    
    Provide a catchy title, a detailed layout description describing where things go, a list of 5-8 suitable plants, and maintenance tips.
  `;

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          layoutDescription: { type: Type.STRING },
          plants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                scientificName: { type: Type.STRING },
                description: { type: Type.STRING },
                careLevel: { type: Type.STRING, enum: ['Easy', 'Moderate', 'Expert'] }
              }
            }
          },
          maintenanceTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as GardenPlan;
  }
  throw new Error("Failed to generate garden plan text.");
};

export const generateInitialGardenImage = async (prefs: GardenPreferences): Promise<string> => {
  const prompt = `
    Photorealistic image of a beautiful ${prefs.style} garden.
    Size: ${prefs.size}.
    Climate appearance: ${prefs.climate}.
    Key features visible: ${prefs.features.join(', ')}.
    High quality, architectural digest style, sunny day.
  `;

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: prompt,
    config: {
      // responseMimeType is not supported for image generation models like 2.5 flash image in this way for the output itself, 
      // but we parse the parts.
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate garden image.");
};

export const editGardenImage = async (base64Image: string, prompt: string): Promise<string> => {
  // Clean base64 string if it contains the data URI prefix
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const mimeType = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1] || 'image/png';

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: `Edit this image: ${prompt}. Maintain the photorealistic style.`
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to edit image.");
};
