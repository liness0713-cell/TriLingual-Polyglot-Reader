import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Genre, Article, Sentence } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sentenceSchema = {
  type: Type.OBJECT,
  properties: {
    ja: { type: Type.STRING, description: "The Japanese text without ruby tags." },
    ja_ruby: { type: Type.STRING, description: "The Japanese text with HTML <ruby> tags for kanji readings." },
    zh: { type: Type.STRING, description: "Chinese translation (Simplified)." },
    en: { type: Type.STRING, description: "English translation." },
  },
  required: ["ja", "ja_ruby", "zh", "en"],
};

const articleSchema = {
  type: Type.OBJECT,
  properties: {
    title_ja: { type: Type.STRING },
    title_ja_ruby: { type: Type.STRING, description: "Japanese title with HTML <ruby> tags" },
    title_zh: { type: Type.STRING },
    title_en: { type: Type.STRING },
    sentences: {
      type: Type.ARRAY,
      items: sentenceSchema,
    },
  },
  required: ["title_ja", "title_ja_ruby", "title_zh", "title_en", "sentences"],
};

export const generateArticleContent = async (
  topic: string,
  genre: Genre,
  difficulty: Difficulty
): Promise<Omit<Article, "id" | "createdAt" | "genre" | "difficulty">> => {
  const modelId = "gemini-2.5-flash";

  const prompt = `
    Create a trilingual study article (Japanese, Chinese, English).
    
    Topic: ${topic || "Random interesting topic"}
    Genre: ${genre}
    Difficulty Level: ${difficulty}
    
    Requirements:
    1. The content must be natural and appropriate for the requested difficulty.
    2. Provide the content split accurately into sentences.
    3. For 'ja_ruby' and 'title_ja_ruby', use standard HTML <ruby>Kanji<rt>reading</rt></ruby> syntax.
    4. Ensure translations are accurate and capture the nuance.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: articleSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const json = JSON.parse(text);
    
    // Map to our internal structure (adding IDs)
    const sentences: Sentence[] = json.sentences.map((s: any, index: number) => ({
      ...s,
      id: `gen-${Date.now()}-${index}`
    }));

    return {
      title: {
        ja: json.title_ja,
        ja_ruby: json.title_ja_ruby,
        zh: json.title_zh,
        en: json.title_en,
      },
      sentences,
    };
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const parseManualInput = async (textInput: string): Promise<Omit<Article, "id" | "createdAt" | "genre" | "difficulty">> => {
  const modelId = "gemini-2.5-flash";

  const prompt = `
    Analyze the following text. It might be in Japanese, Chinese, or English.
    1. Detect the source language.
    2. Split it into logical sentences.
    3. Translate each sentence into the missing two languages (Target: Japanese, Chinese, English).
    4. Provide the 'ja_ruby' version for the Japanese text using HTML <ruby> tags.
    5. Create a suitable title in all 3 languages, including a 'title_ja_ruby' version with HTML tags.
    
    Input Text:
    """
    ${textInput}
    """
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: articleSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    const json = JSON.parse(text);

    const sentences: Sentence[] = json.sentences.map((s: any, index: number) => ({
      ...s,
      id: `manual-${Date.now()}-${index}`
    }));

    return {
      title: {
        ja: json.title_ja,
        ja_ruby: json.title_ja_ruby,
        zh: json.title_zh,
        en: json.title_en,
      },
      sentences,
    };

  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw error;
  }
}

export const analyzeSentenceGrammar = async (sentence: Sentence): Promise<string> => {
    const modelId = "gemini-2.5-flash";

    const prompt = `
      Act as a professional language teacher (Japanese/Chinese/English). 
      Analyze the following sentence structure deeply.
      
      Target Sentence (Japanese): ${sentence.ja}
      Chinese: ${sentence.zh}
      English: ${sentence.en}

      Please provide:
      1. A breakdown of the Japanese grammar points used (JLPT level if applicable).
      2. Key vocabulary with meanings.
      3. Explanation of any difficult nuances or cultural context.
      4. Brief comparison with the Chinese/English structure if interesting differences exist.

      Format the output using Markdown. Use bolding and lists for readability.
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
        });
        return response.text || "Could not generate analysis.";
    } catch (error) {
        console.error("Analysis Error:", error);
        return "Error analyzing sentence.";
    }
}