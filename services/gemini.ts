
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const generateAIImage = async (prompt: string, sourceImageBase64?: string): Promise<string> => {
  const ai = getAIClient();
  const model = 'gemini-2.5-flash-image';
  
  const contents: any = {
    parts: [{ text: prompt }]
  };

  if (sourceImageBase64) {
    contents.parts.unshift({
      inlineData: {
        data: sourceImageBase64.split(',')[1],
        mimeType: 'image/png'
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
};

export const generateAIVideo = async (prompt: string, imageBase64?: string): Promise<string> => {
  const ai = getAIClient();
  const model = 'veo-3.1-fast-generate-preview';
  
  const videoParams: any = {
    model,
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  };

  if (imageBase64) {
    videoParams.image = {
      imageBytes: imageBase64.split(',')[1],
      mimeType: 'image/png'
    };
  }

  let operation = await ai.models.generateVideos(videoParams);
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");
  
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
