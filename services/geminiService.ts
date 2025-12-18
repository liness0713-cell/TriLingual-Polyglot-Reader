
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Genre, ArticleLength, Article, Sentence, NewsHeadline } from "../types";

declare var process: {
  env: {
    API_KEY: string;
  };
};

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

// Fetch latest headlines using Search Grounding
export const fetchLatestHeadlines = async (providerUrl: string): Promise<NewsHeadline[]> => {
  const modelId = "gemini-3-flash-preview";
  
  const prompt = `Find the latest 12 news headlines and short snippets from ${providerUrl}. 
  Focus on the most recent, top-level news. Return the results in a clear list.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Fallback: Parse the text for titles and links if grounding chunks are sparse
    const parsePrompt = `Based on these news results:
    "${response.text || ""}"
    Extract them into a JSON array of objects with keys: "title", "snippet", "link". 
    Only return the JSON.`;

    const parseResponse = await ai.models.generateContent({
        model: modelId,
        contents: parsePrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        snippet: { type: Type.STRING },
                        link: { type: Type.STRING }
                    },
                    required: ["title", "snippet", "link"]
                }
            }
        }
    });

    return JSON.parse(parseResponse.text || "[]");
  } catch (error) {
    console.error("Headline Fetch Error:", error);
    return [];
  }
};

// Process a specific news article URL into trilingual study material
export const processNewsArticle = async (headline: NewsHeadline, sourceName: string): Promise<Omit<Article, "id" | "createdAt">> => {
  const modelId = "gemini-3-flash-preview";

  const prompt = `
    I want to study the following news article:
    Title: ${headline.title}
    URL: ${headline.link}
    Source: ${sourceName}

    1. Use Google Search to find the actual content of this article.
    2. Extract the main body text (exclude ads, menus).
    3. Split the text into logical sentences.
    4. Provide the content in Japanese, Chinese, and English.
    5. For 'ja_ruby' and 'title_ja_ruby', use HTML <ruby> tags for all Kanji.
    6. Ensure the translations are highly accurate and match the professional tone of the original news source.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: articleSchema,
      },
    });

    const json = JSON.parse(response.text || "{}");
    
    const sentences: Sentence[] = (json.sentences || []).map((s: any, index: number) => ({
      ...s,
      id: `news-${Date.now()}-${index}`
    }));

    return {
      title: {
        ja: json.title_ja || "",
        ja_ruby: json.title_ja_ruby || "",
        zh: json.title_zh || "",
        en: json.title_en || "",
      },
      genre: Genre.News,
      difficulty: "Press Reading",
      sentences,
      sourceUrl: headline.link,
      sourceName: sourceName
    };
  } catch (error) {
    console.error("Article Processing Error:", error);
    throw error;
  }
};

export const generateArticleContent = async (
  topic: string,
  genre: Genre,
  difficulty: Difficulty,
  length: ArticleLength
): Promise<Omit<Article, "id" | "createdAt" | "genre" | "difficulty">> => {
  const modelId = "gemini-3-flash-preview";

  let lengthPrompt = "";
  switch (length) {
    case ArticleLength.Short:
      lengthPrompt = "Generate a short, concise article (approx. 6-10 sentences).";
      break;
    case ArticleLength.Medium:
      lengthPrompt = "Generate a standard length article (approx. 15-20 sentences).";
      break;
    case ArticleLength.Long:
      lengthPrompt = "Generate a long, comprehensive article (approx. 30-45 sentences).";
      break;
    default:
      lengthPrompt = "Generate a standard length article.";
  }

  const prompt = `
    Create a trilingual study article (Japanese, Chinese, English).
    Topic: ${topic || "Random interesting topic"}
    Genre: ${genre}
    Difficulty Level: ${difficulty}
    Length Requirement: ${lengthPrompt}
    Requirements:
    1. The content must be natural and appropriate for the requested difficulty.
    2. Provide the content split accurately into sentences.
    3. For 'ja_ruby' and 'title_ja_ruby', use standard HTML <ruby>Kanji<rt>reading</rt></ruby> syntax.
    4. Ensure translations are accurate.
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

    const json = JSON.parse(response.text || "{}");
    const sentences: Sentence[] = (json.sentences || []).map((s: any, index: number) => ({
      ...s,
      id: `gen-${Date.now()}-${index}`
    }));

    return {
      title: {
        ja: json.title_ja || "",
        ja_ruby: json.title_ja_ruby || "",
        zh: json.title_zh || "",
        en: json.title_en || "",
      },
      sentences,
    };
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const continueArticleContent = async (
    article: Article,
    userInstruction: string
  ): Promise<Sentence[]> => {
    const modelId = "gemini-3-flash-preview";
    const contextSentences = article.sentences.slice(-10);
    const contextText = contextSentences.map(s => s.ja).join("\n");
  
    const prompt = `
      Continue this story/article.
      Current Title: ${article.title.ja}
      Genre: ${article.genre}
      Difficulty: ${article.difficulty}
      Last context: ${contextText}
      Direction: ${userInstruction || "Continue naturally."}
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
                sentences: { type: Type.ARRAY, items: sentenceSchema }
            },
            required: ["sentences"]
          }
        },
      });
      const json = JSON.parse(response.text || "{}");
      return (json.sentences || []).map((s: any, index: number) => ({
        ...s,
        id: `cont-${Date.now()}-${index}`
      }));
    } catch (error) {
      console.error("Continuation Error:", error);
      throw error;
    }
  };

export const parseManualInput = async (textInput: string): Promise<Omit<Article, "id" | "createdAt" | "genre" | "difficulty">> => {
  const modelId = "gemini-3-flash-preview";
  const prompt = `Analyze and translate this text into Japanese (with ruby), Chinese, and English: ${textInput}`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: articleSchema,
      },
    });
    const json = JSON.parse(response.text || "{}");
    return {
      title: {
        ja: json.title_ja || "",
        ja_ruby: json.title_ja_ruby || "",
        zh: json.title_zh || "",
        en: json.title_en || "",
      },
      sentences: (json.sentences || []).map((s: any, index: number) => ({ ...s, id: `manual-${Date.now()}-${index}` })),
    };
  } catch (error) {
    console.error("Parsing Error:", error);
    throw error;
  }
}

export const analyzeSentenceGrammar = async (sentence: Sentence): Promise<string> => {
    const modelId = "gemini-3-flash-preview";
    const prompt = `Deeply analyze this sentence for a language learner. 
    JP: ${sentence.ja} 
    CN: ${sentence.zh} 
    EN: ${sentence.en}. 
    Focus on grammar points, vocabulary, and nuances. Use Markdown.`;

    try {
        const response = await ai.models.generateContent({ model: modelId, contents: prompt });
        return response.text || "Could not generate analysis.";
    } catch (error) {
        return "Error analyzing sentence.";
    }
}
