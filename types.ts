export enum Difficulty {
  Beginner = "Beginner (N5/A1)",
  Elementary = "Elementary (N4/A2)",
  Intermediate = "Intermediate (N3/B1)",
  Advanced = "Advanced (N2/B2)",
  Expert = "Expert (N1/C1+)"
}

export enum Genre {
  DailyLife = "Daily Life",
  News = "News & Current Events",
  Fiction = "Short Story/Fiction",
  Business = "Business & Economy",
  Science = "Science & Technology",
  History = "History & Culture",
  Travel = "Travel & Tourism"
}

export interface Sentence {
  id: string;
  ja: string;         // Plain Japanese
  ja_ruby: string;    // HTML string with <ruby> tags
  zh: string;         // Chinese translation
  en: string;         // English translation
}

export interface Article {
  id: string;
  title: {
    ja: string;
    ja_ruby?: string; // HTML string with <ruby> tags for title
    zh: string;
    en: string;
  };
  genre: Genre | string;
  difficulty: Difficulty | string;
  sentences: Sentence[];
  createdAt: number;
}

export interface AnalysisResult {
  markdown: string;
}