import { Article } from "../types";

const STORAGE_KEY = "trilingual_reader_articles";

export const getSavedArticles = (): Article[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load articles", e);
    return [];
  }
};

export const saveArticle = (article: Article): void => {
  const articles = getSavedArticles();
  // Check if exists, update if so, else prepend
  const index = articles.findIndex((a) => a.id === article.id);
  if (index >= 0) {
    articles[index] = article;
  } else {
    articles.unshift(article);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
};

export const deleteArticle = (id: string): void => {
  const articles = getSavedArticles();
  const filtered = articles.filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const exportToCSV = (article: Article) => {
    const headers = ["Japanese", "Japanese (HTML)", "Chinese", "English"];
    const rows = article.sentences.map(s => [
        `"${s.ja.replace(/"/g, '""')}"`,
        `"${s.ja_ruby.replace(/"/g, '""')}"`,
        `"${s.zh.replace(/"/g, '""')}"`,
        `"${s.en.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${article.title.en.replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
