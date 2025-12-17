
import { GoogleGenAI, Type } from "@google/genai";
import { OutfitAnalysis } from "../types";

export const analyzeFashion = async (base64Image: string): Promise<OutfitAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `Anda adalah Fashion Visual Analyst tingkat tinggi untuk majalah mode premium. 
  Tugas Anda adalah membedah outfit dari foto dengan presisi total untuk pembuatan lookbook.
  
  Fokus Utama:
  - Identifikasi item pakaian secara mendetail (misal: 'Oversized Essentials white hoodie', 'Black Nike leggings').
  - Detil Brand & Logo: WAJIB mengenali logo brand yang terlihat jelas (Nike, Essentials, Fear of God, dll). Pastikan brand ini disebutkan dalam breakdown dan prompt rekreasi.
  - Material: Identifikasi tekstur kain (fleece, cotton, spandex, polished silver).
  - Warna: Gunakan istilah warna yang bersih (Optic White, Jet Black, Silver).
  
  ATURAN KETAT:
  - ABAIKAN wajah, identitas, atau bentuk tubuh manusia.
  - Berikan 'recreationPrompt' yang menginstruksikan pembuatan "Professional Fashion Flat Lay" yang rapi di atas background putih bersih. 
  - Item harus ditata secara terpisah namun harmonis, menyerupai katalog e-commerce high-end atau Pinterest aesthetic.`;

  const prompt = "Analisis outfit ini dengan fokus pada brand dan tata letak flat-lay. Pastikan semua logo brand yang terlihat (seperti Nike atau Essentials) tercatat dengan benar. Susun prompt rekreasi untuk hasil flat-lay yang sempurna.";

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          breakdown: {
            type: Type.OBJECT,
            properties: {
              top: { type: Type.STRING },
              bottom: { type: Type.STRING },
              footwear: { type: Type.STRING },
              accessories: { type: Type.STRING }
            },
            required: ["top", "bottom", "footwear", "accessories"]
          },
          colorPalette: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          styleCategory: { type: Type.STRING },
          materialHighlights: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          aestheticVibe: { type: Type.STRING },
          recreationPrompt: { type: Type.STRING }
        },
        required: ["breakdown", "colorPalette", "styleCategory", "materialHighlights", "aestheticVibe", "recreationPrompt"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Gagal menerima analisis.");
  return JSON.parse(text) as OutfitAnalysis;
};

export const generateRecreationImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const model = "gemini-2.5-flash-image";
  
  const enhancedPrompt = `High-end commercial fashion flat-lay photography. Professional studio arrangement of garments on a pure solid white background. Elements: ${prompt}. Perfect centering, clean spacing between items, soft shadow for depth, 8k resolution, hyper-realistic fabric textures, accurate branding logos, minimalist aesthetic.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [{ text: enhancedPrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4"
      }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData?.data) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }

  throw new Error("Gagal membuat gambar rekreasi.");
};
