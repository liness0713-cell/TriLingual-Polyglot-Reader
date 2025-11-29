import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Library, Settings, Menu, X, Download, Trash2, PlayCircle, Search, Leaf, Sparkles, Send, Type } from 'lucide-react';
import { Article, Difficulty, Genre, ArticleLength, Sentence } from './types';
import * as GeminiService from './services/geminiService';
import * as StorageService from './services/storageService';
import ReactMarkdown from 'react-markdown';

// --- Colors for Mori/Forest Theme ---
// Bg Main: #faf9f6 (Off white)
// Sidebar: #f3f1eb (Warm light beige)
// Accents: #739072 (Sage Green), #4f6f52 (Forest Green)
// Text: #4a403a (Dark Brown/Bark)
// Highlights: #e9edc9 (Pale Green)

// 1. Sidebar Component
const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen 
}: { 
  activeTab: string, 
  setActiveTab: (t: string) => void,
  isOpen: boolean,
  setIsOpen: (o: boolean) => void
}) => {
  const menuItems = [
    { id: 'generate', icon: <PenTool size={20} />, label: 'AI Generator' },
    { id: 'manual', icon: <Settings size={20} />, label: 'Manual Input' },
    { id: 'library', icon: <Library size={20} />, label: 'My Library' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#4a403a]/20 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar - Mori Style */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#f3f1eb] dark:bg-[#2c2a27] border-r border-[#e6e2d3] dark:border-[#3e3b36] transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col font-sans`}>
        <div className="flex items-center justify-between p-6 border-b border-[#e6e2d3] dark:border-[#3e3b36]">
          <h1 className="text-xl font-bold text-[#4a403a] dark:text-[#e8e6e3] tracking-tight flex items-center gap-2">
            <Leaf size={20} className="text-[#739072]" />
            Polyglot
          </h1>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-[#8c8279] hover:text-[#5f7161]">
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-[#e2e0d6] dark:bg-[#3e3b36] text-[#4a403a] dark:text-[#e8e6e3] font-semibold shadow-sm' 
                  : 'text-[#786b59] dark:text-[#a8a29e] hover:bg-[#ebe9e1] dark:hover:bg-[#353330] hover:text-[#5f7161]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer / Friend Link */}
        <div className="p-6 border-t border-[#e6e2d3] dark:border-[#3e3b36] text-center">
            <a 
              href="https://my-portfolio-beige-five-56.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-sm text-[#8c8279] hover:text-[#739072] transition-colors font-medium"
            >
              <span>千葉２狗 🐶</span>
            </a>
        </div>
      </div>
    </>
  );
};

// 2. Generator Component
const Generator = ({ onArticleGenerated }: { onArticleGenerated: (a: Article) => void }) => {
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState<Genre>(Genre.DailyLife);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Intermediate);
  const [length, setLength] = useState<ArticleLength>(ArticleLength.Short);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const content = await GeminiService.generateArticleContent(topic, genre, difficulty, length);
      const newArticle: Article = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        genre,
        difficulty,
        ...content
      };
      StorageService.saveArticle(newArticle);
      onArticleGenerated(newArticle);
    } catch (e) {
      alert("Failed to generate article. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-12">
      <h2 className="text-3xl font-bold mb-8 text-[#4a403a] dark:text-[#e8e6e3] tracking-tight">Generate Study Material</h2>
      
      <div className="space-y-8 bg-[#fffefb] dark:bg-[#2c2a27] p-8 rounded-2xl shadow-sm border border-[#e6e2d3] dark:border-[#3e3b36]">
        <div>
          <label className="block text-sm font-bold text-[#786b59] dark:text-[#a8a29e] mb-2 uppercase tracking-wide">Topic (Optional)</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-[#e6e2d3] dark:border-[#3e3b36] bg-[#faf9f6] dark:bg-[#353330] text-[#4a403a] dark:text-[#e8e6e3] focus:ring-2 focus:ring-[#739072] outline-none transition placeholder-[#b5b0a8]"
            placeholder="e.g., A trip to Kyoto, The future of AI, Cooking Ramen"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
           {/* Row 1: Genre & Difficulty */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#786b59] dark:text-[#a8a29e] mb-2 uppercase tracking-wide">Genre</label>
                <div className="relative">
                    <select 
                    className="w-full px-4 py-3 rounded-xl border border-[#e6e2d3] dark:border-[#3e3b36] bg-[#faf9f6] dark:bg-[#353330] text-[#4a403a] dark:text-[#e8e6e3] outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-[#739072]"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value as Genre)}
                    >
                    {Object.values(Genre).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#8c8279]">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#786b59] dark:text-[#a8a29e] mb-2 uppercase tracking-wide">Difficulty</label>
                <div className="relative">
                    <select 
                    className="w-full px-4 py-3 rounded-xl border border-[#e6e2d3] dark:border-[#3e3b36] bg-[#faf9f6] dark:bg-[#353330] text-[#4a403a] dark:text-[#e8e6e3] outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-[#739072]"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    >
                    {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#8c8279]">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                </div>
              </div>
           </div>

           {/* Row 2: Length */}
           <div>
              <label className="block text-sm font-bold text-[#786b59] dark:text-[#a8a29e] mb-2 uppercase tracking-wide">Article Length</label>
              <div className="relative">
                  <select 
                  className="w-full px-4 py-3 rounded-xl border border-[#e6e2d3] dark:border-[#3e3b36] bg-[#faf9f6] dark:bg-[#353330] text-[#4a403a] dark:text-[#e8e6e3] outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-[#739072]"
                  value={length}
                  onChange={(e) => setLength(e.target.value as ArticleLength)}
                  >
                  {Object.values(ArticleLength).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#8c8279]">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                  </div>
              </div>
           </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-sm ${
            loading 
              ? 'bg-[#b5b0a8] cursor-not-allowed' 
              : 'bg-[#739072] hover:bg-[#5f7161] hover:shadow-md transform hover:-translate-y-0.5'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Writing...</span>
            </span>
          ) : 'Generate Article'}
        </button>
      </div>
    </div>
  );
};

// 3. Manual Input Component
const ManualInput = ({ onArticleGenerated }: { onArticleGenerated: (a: Article) => void }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const content = await GeminiService.parseManualInput(text);
      const newArticle: Article = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        genre: 'Custom',
        difficulty: 'Manual',
        ...content
      };
      StorageService.saveArticle(newArticle);
      onArticleGenerated(newArticle);
    } catch (e) {
      alert("Failed to process text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-12">
      <h2 className="text-3xl font-bold mb-8 text-[#4a403a] dark:text-[#e8e6e3] tracking-tight">Manual Input</h2>
      <div className="bg-[#fffefb] dark:bg-[#2c2a27] p-8 rounded-2xl shadow-sm border border-[#e6e2d3] dark:border-[#3e3b36]">
        <p className="mb-4 text-[#786b59] dark:text-[#a8a29e] text-sm">
          Paste any text. We'll format it, add readings, and translate it for you.
        </p>
        <textarea
          className="w-full h-48 p-4 rounded-xl border border-[#e6e2d3] dark:border-[#3e3b36] bg-[#faf9f6] dark:bg-[#353330] text-[#4a403a] dark:text-[#e8e6e3] focus:ring-2 focus:ring-[#739072] outline-none resize-none mb-6 placeholder-[#b5b0a8]"
          placeholder="Paste Japanese, Chinese, or English text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={handleParse}
          disabled={loading || !text.trim()}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
            loading || !text.trim()
              ? 'bg-[#b5b0a8] cursor-not-allowed' 
              : 'bg-[#8f5e5e] hover:bg-[#7a4f4f] shadow-sm hover:shadow-md'
          }`}
        >
          {loading ? 'Analyzing...' : 'Process & Learn'}
        </button>
      </div>
    </div>
  );
};

// 4. Reader Component
const Reader = ({ 
    article, 
    onBack,
    onUpdate
}: { 
    article: Article, 
    onBack: () => void,
    onUpdate: (updatedArticle: Article) => void
}) => {
  const [selectedSentence, setSelectedSentence] = useState<Sentence | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showRuby, setShowRuby] = useState(true);
  const [fontSizeLevel, setFontSizeLevel] = useState(1); // 0 = sm, 1 = normal, 2 = lg, 3 = xl, 4 = xxl
  
  // Continuation State
  const [continuationPrompt, setContinuationPrompt] = useState("");
  const [isExtending, setIsExtending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const speak = (text: string, lang: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang; 
    window.speechSynthesis.speak(utterance);
  };

  const handleAnalyze = async (s: Sentence) => {
    setAnalyzing(true);
    setAnalysis(null);
    const result = await GeminiService.analyzeSentenceGrammar(s);
    setAnalysis(result);
    setAnalyzing(false);
  };

  const handleExtendStory = async () => {
    setIsExtending(true);
    try {
        const newSentences = await GeminiService.continueArticleContent(article, continuationPrompt);
        const updatedArticle: Article = {
            ...article,
            sentences: [...article.sentences, ...newSentences]
        };
        
        // Update via parent callback
        onUpdate(updatedArticle);
        
        // Clear prompt
        setContinuationPrompt("");
        
        // Scroll to new content after a brief delay for render
        setTimeout(() => {
             scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);

    } catch (e) {
        alert("Could not extend the story. Please try again.");
    } finally {
        setIsExtending(false);
    }
  }

  // Font Size Classes
  const getFontSizeClass = (level: number) => {
      switch(level) {
          case 0: return "text-lg md:text-xl";
          case 1: return "text-xl md:text-2xl"; // Default
          case 2: return "text-2xl md:text-3xl";
          case 3: return "text-3xl md:text-4xl";
          case 4: return "text-4xl md:text-5xl leading-tight";
          default: return "text-xl md:text-2xl";
      }
  }

  const getZhFontSizeClass = (level: number) => {
      switch(level) {
          case 0: return "text-base";
          case 1: return "text-lg"; // Default
          case 2: return "text-xl";
          case 3: return "text-2xl";
          case 4: return "text-3xl";
          default: return "text-lg";
      }
  }

  const getEnFontSizeClass = (level: number) => {
      switch(level) {
          case 0: return "text-sm";
          case 1: return "text-base"; // Default
          case 2: return "text-lg";
          case 3: return "text-xl";
          case 4: return "text-2xl";
          default: return "text-base";
      }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-[#faf9f6] dark:bg-[#201e1c]">
      {/* Top Bar - Mori Style */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#fffefb] dark:bg-[#2c2a27] border-b border-[#e6e2d3] dark:border-[#3e3b36] shrink-0 z-10 shadow-sm">
        <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-[#f3f1eb] dark:hover:bg-[#3e3b36] rounded-full transition-colors">
                <X size={22} className="text-[#8c8279] dark:text-[#a8a29e]"/>
            </button>
            <h2 className="font-bold text-[#4a403a] dark:text-[#e8e6e3] truncate max-w-xs md:max-w-md text-lg hidden sm:block">
                {showRuby && article.title.ja_ruby ? (
                     <span dangerouslySetInnerHTML={{__html: article.title.ja_ruby}} />
                ) : article.title.ja}
            </h2>
        </div>
        <div className="flex items-center space-x-3">
           {/* Font Size Control */}
           <div className="flex items-center space-x-1 border border-[#e6e2d3] dark:border-[#3e3b36] rounded-lg p-1 bg-[#fffefb] dark:bg-[#2c2a27] mr-2">
                <button 
                    onClick={() => setFontSizeLevel(Math.max(0, fontSizeLevel - 1))}
                    disabled={fontSizeLevel === 0}
                    className="p-1 text-[#8c8279] hover:text-[#4a403a] disabled:opacity-30 transition-colors"
                >
                    <Type size={14} />
                </button>
                <span className="text-xs w-4 text-center font-mono text-[#4a403a] dark:text-[#a8a29e]">{fontSizeLevel + 1}</span>
                <button 
                    onClick={() => setFontSizeLevel(Math.min(4, fontSizeLevel + 1))}
                    disabled={fontSizeLevel === 4}
                    className="p-1 text-[#8c8279] hover:text-[#4a403a] disabled:opacity-30 transition-colors"
                >
                    <Type size={20} />
                </button>
           </div>

           <button 
             onClick={() => setShowRuby(!showRuby)} 
             className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${showRuby ? 'bg-[#4a403a] text-[#f3f1eb] border-[#4a403a]' : 'bg-transparent text-[#8c8279] border-[#d4d0c7] hover:border-[#8c8279]'}`}
           >
             RUBY {showRuby ? 'ON' : 'OFF'}
           </button>
           <button 
             onClick={() => StorageService.exportToCSV(article)}
             className="p-2 text-[#8c8279] hover:text-[#4a403a] hover:bg-[#f3f1eb] dark:hover:bg-[#3e3b36] rounded-full transition-colors" title="Export CSV">
             <Download size={20} />
           </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Text Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 pb-24">
            
            <div className="mb-10 text-center space-y-3">
                <h1 className="text-2xl md:text-4xl font-bold text-[#4a403a] dark:text-[#e8e6e3] leading-tight">
                    {showRuby && article.title.ja_ruby ? (
                        <span dangerouslySetInnerHTML={{__html: article.title.ja_ruby}} />
                    ) : article.title.ja}
                </h1>
                <p className="text-xl text-[#786b59] dark:text-[#a8a29e] font-medium">{article.title.zh}</p>
                <p className="text-md text-[#8c8279] dark:text-[#786b59] italic serif">{article.title.en}</p>
                <div className="flex justify-center gap-3 mt-4">
                    <span className="text-xs px-3 py-1 bg-[#e9edc9] dark:bg-[#3e3b36] rounded-full text-[#5f7161] dark:text-[#a8a29e] font-semibold">{article.difficulty}</span>
                    <span className="text-xs px-3 py-1 bg-[#e9edc9] dark:bg-[#3e3b36] rounded-full text-[#5f7161] dark:text-[#a8a29e] font-semibold">{article.genre}</span>
                </div>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
                {article.sentences.map((s) => (
                    <div 
                        key={s.id}
                        onClick={() => { setSelectedSentence(s); setAnalysis(null); }}
                        className={`p-6 rounded-2xl transition-all cursor-pointer border ${
                            selectedSentence?.id === s.id 
                            ? 'bg-[#f0efeb] dark:bg-[#3e3b36] border-[#b5b0a8] dark:border-[#5c5954] shadow-md transform scale-[1.01]' 
                            : 'bg-[#fffefb] dark:bg-[#2c2a27] border-transparent shadow-sm hover:shadow-md hover:border-[#e6e2d3]'
                        }`}
                    >
                        {/* Japanese */}
                        <div className={`${getFontSizeClass(fontSizeLevel)} leading-relaxed text-[#4a403a] dark:text-[#e8e6e3] font-medium mb-3 transition-all duration-300`}>
                           {showRuby ? (
                               <span dangerouslySetInnerHTML={{__html: s.ja_ruby}} />
                           ) : (
                               <span>{s.ja}</span>
                           )}
                        </div>

                        {/* Translations */}
                        <div className={`space-y-2 transition-opacity duration-300 ${selectedSentence?.id === s.id ? 'opacity-100' : 'opacity-60'}`}>
                             <p className={`text-[#5c524b] dark:text-[#b5b0a8] ${getZhFontSizeClass(fontSizeLevel)} transition-all duration-300`}>{s.zh}</p>
                             <p className={`text-[#8c8279] dark:text-[#786b59] italic serif ${getEnFontSizeClass(fontSizeLevel)} transition-all duration-300`}>{s.en}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Continuation Section */}
            <div className="max-w-3xl mx-auto pt-8 border-t border-[#e6e2d3] dark:border-[#3e3b36] mt-12">
                 <div className="bg-[#f3f1eb] dark:bg-[#2c2a27] p-6 rounded-2xl border border-[#d4d0c7] dark:border-[#3e3b36]">
                    <h3 className="text-lg font-bold text-[#4a403a] dark:text-[#e8e6e3] mb-3 flex items-center gap-2">
                        <Sparkles size={18} className="text-[#739072]" /> 
                        Continue Story
                    </h3>
                    <p className="text-sm text-[#8c8279] mb-4">
                        Want to read more? Tell AI what should happen next, or leave it blank for a surprise.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4">
                        <textarea
                            disabled={isExtending}
                            value={continuationPrompt}
                            onChange={(e) => setContinuationPrompt(e.target.value)}
                            placeholder="e.g. They decide to go to a ramen shop..."
                            className="flex-1 px-4 py-3 rounded-xl border border-[#e6e2d3] dark:border-[#3e3b36] bg-[#fffefb] dark:bg-[#353330] text-[#4a403a] dark:text-[#e8e6e3] focus:ring-2 focus:ring-[#739072] outline-none resize-none h-20 md:h-auto"
                        />
                        <button 
                            onClick={handleExtendStory}
                            disabled={isExtending}
                            className={`px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap ${
                                isExtending 
                                ? 'bg-[#b5b0a8] cursor-not-allowed' 
                                : 'bg-[#739072] hover:bg-[#5f7161] hover:shadow-md'
                            }`}
                        >
                            {isExtending ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    <span>Append</span>
                                    <Send size={18} />
                                </>
                            )}
                        </button>
                    </div>
                 </div>
                 {/* Scroll anchor */}
                 <div ref={scrollRef}></div>
            </div>
        </div>

        {/* Right Analysis Drawer - Mori Style */}
        {selectedSentence && (
            <div className="absolute top-0 right-0 h-full w-full md:w-[450px] bg-[#fffefb] dark:bg-[#2c2a27] border-l border-[#e6e2d3] dark:border-[#3e3b36] shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#e6e2d3] dark:border-[#3e3b36] bg-[#f9f8f4] dark:bg-[#2c2a27]">
                    <span className="font-bold text-[#5c524b] dark:text-[#e8e6e3] flex items-center gap-2">
                        <Search size={18} className="text-[#739072]"/> Analysis
                    </span>
                    <button 
                        onClick={() => setSelectedSentence(null)} 
                        className="p-2 hover:bg-[#e6e2d3] dark:hover:bg-[#3e3b36] rounded-full text-[#8c8279] hover:text-[#5f7161] transition-colors"
                        title="Close Analysis"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Audio Controls */}
                    <div className="flex justify-center space-x-8 pb-6 border-b border-[#e6e2d3] dark:border-[#3e3b36]">
                         <button onClick={() => speak(selectedSentence.ja, 'ja-JP')} className="flex flex-col items-center text-[#786b59] hover:text-[#4a403a] dark:text-[#a8a29e] dark:hover:text-[#e8e6e3] transition-all group">
                            <div className="p-3 bg-[#f3f1eb] dark:bg-[#3e3b36] rounded-full group-hover:bg-[#e6e2d3] dark:group-hover:bg-[#4a4742] mb-1">
                                <PlayCircle size={24} />
                            </div>
                            <span className="text-[10px] font-bold tracking-wider">JP</span>
                         </button>
                         <button onClick={() => speak(selectedSentence.zh, 'zh-CN')} className="flex flex-col items-center text-[#786b59] hover:text-[#4a403a] dark:text-[#a8a29e] dark:hover:text-[#e8e6e3] transition-all group">
                            <div className="p-3 bg-[#f3f1eb] dark:bg-[#3e3b36] rounded-full group-hover:bg-[#e6e2d3] dark:group-hover:bg-[#4a4742] mb-1">
                                <PlayCircle size={24} />
                            </div>
                            <span className="text-[10px] font-bold tracking-wider">CN</span>
                         </button>
                         <button onClick={() => speak(selectedSentence.en, 'en-US')} className="flex flex-col items-center text-[#786b59] hover:text-[#4a403a] dark:text-[#a8a29e] dark:hover:text-[#e8e6e3] transition-all group">
                            <div className="p-3 bg-[#f3f1eb] dark:bg-[#3e3b36] rounded-full group-hover:bg-[#e6e2d3] dark:group-hover:bg-[#4a4742] mb-1">
                                <PlayCircle size={24} />
                            </div>
                            <span className="text-[10px] font-bold tracking-wider">EN</span>
                         </button>
                    </div>

                    {/* Text Details */}
                    <div className="space-y-6">
                        <div className="p-5 bg-[#f3f1eb] dark:bg-[#3e3b36] rounded-xl border border-[#e6e2d3] dark:border-[#4a4742]">
                             <p className="text-xs font-bold text-[#8c8279] mb-3 uppercase tracking-wide">Target (Japanese)</p>
                             <div className="text-xl text-[#4a403a] dark:text-[#e8e6e3] leading-relaxed font-medium">
                                 {showRuby ? <span dangerouslySetInnerHTML={{__html: selectedSentence.ja_ruby}} /> : selectedSentence.ja}
                             </div>
                        </div>

                        <div className="space-y-4">
                            <div className="pl-4 border-l-4 border-[#b5b0a8] dark:border-[#5c5954]">
                                <p className="text-xs font-bold text-[#8c8279] mb-1 uppercase tracking-wide">Chinese Translation</p>
                                <p className="text-[#5c524b] dark:text-[#b5b0a8] text-lg">{selectedSentence.zh}</p>
                            </div>
                            <div className="pl-4 border-l-4 border-[#d4d0c7] dark:border-[#4a4742]">
                                <p className="text-xs font-bold text-[#8c8279] mb-1 uppercase tracking-wide">English Translation</p>
                                <p className="text-[#8c8279] dark:text-[#786b59] italic font-serif">{selectedSentence.en}</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Grammar Analysis */}
                    <div>
                         {!analysis && !analyzing ? (
                             <button 
                                onClick={() => handleAnalyze(selectedSentence)}
                                className="w-full py-3 bg-[#739072] hover:bg-[#5f7161] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
                             >
                                <Search size={18} /> Deep Analysis
                             </button>
                         ) : (
                             <div className="bg-[#faf9f6] dark:bg-[#353330] rounded-xl p-5 border border-[#e6e2d3] dark:border-[#3e3b36]">
                                  {analyzing ? (
                                      <div className="flex flex-col items-center justify-center py-8 text-[#8c8279] space-y-3">
                                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#739072]"></div>
                                          <span className="text-sm font-medium">Consulting Sensei...</span>
                                      </div>
                                  ) : (
                                      <div className="prose prose-stone prose-sm dark:prose-invert max-w-none">
                                          <h4 className="text-sm font-bold text-[#8c8279] uppercase mb-3 border-b border-[#e6e2d3] dark:border-[#3e3b36] pb-2">Sensei's Notes</h4>
                                          <ReactMarkdown>{analysis || ''}</ReactMarkdown>
                                      </div>
                                  )}
                             </div>
                         )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// 5. Library Component
const LibraryView = ({ onSelect }: { onSelect: (a: Article) => void }) => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    setArticles(StorageService.getSavedArticles());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm("Are you sure you want to delete this article?")) {
        StorageService.deleteArticle(id);
        setArticles(StorageService.getSavedArticles());
    }
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#b5b0a8]">
        <Library size={64} className="mb-4 opacity-30" />
        <p className="text-xl font-medium mb-1">Empty Library</p>
        <p className="text-sm">Create content using the AI Generator.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-[#4a403a] dark:text-[#e8e6e3] tracking-tight">My Library</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <div 
            key={article.id}
            onClick={() => onSelect(article)}
            className="group bg-[#fffefb] dark:bg-[#2c2a27] p-6 rounded-2xl border border-[#e6e2d3] dark:border-[#3e3b36] hover:shadow-lg hover:border-[#d4d0c7] transition-all cursor-pointer relative"
          >
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold px-3 py-1 bg-[#f0efeb] dark:bg-[#3e3b36] text-[#786b59] dark:text-[#a8a29e] rounded-full uppercase tracking-wider">
                    {article.difficulty.split(' ')[0]}
                </span>
                <span className="text-xs text-[#b5b0a8] font-mono">
                    {new Date(article.createdAt).toLocaleDateString()}
                </span>
            </div>
            <h3 className="text-xl font-bold text-[#4a403a] dark:text-[#e8e6e3] mb-2 line-clamp-1 group-hover:text-[#739072] transition-colors">{article.title.ja}</h3>
            <p className="text-sm text-[#8c8279] dark:text-[#a8a29e] line-clamp-1 mb-3 italic">{article.title.en}</p>
            <p className="text-xs text-[#b5b0a8] font-medium">{article.sentences.length} Sentences • {article.genre}</p>
            
            <button 
                onClick={(e) => handleDelete(e, article.id)}
                className="absolute bottom-6 right-6 p-2 text-[#d4d0c7] hover:text-[#8f5e5e] hover:bg-[#f3f1eb] dark:hover:bg-[#3e3b36] rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main App Container
export default function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleArticleCreated = (article: Article) => {
    setCurrentArticle(article);
  };

  const handleArticleUpdated = (updatedArticle: Article) => {
    setCurrentArticle(updatedArticle);
    StorageService.saveArticle(updatedArticle);
  };

  const handleBackToMenu = () => {
      setCurrentArticle(null);
  }

  // If reading an article, show Reader regardless of tab (simplified nav)
  if (currentArticle) {
      return (
          <div className="h-screen bg-[#faf9f6] dark:bg-[#201e1c] text-[#4a403a] dark:text-[#e8e6e3]">
             <Reader 
                article={currentArticle} 
                onBack={handleBackToMenu} 
                onUpdate={handleArticleUpdated}
             />
          </div>
      )
  }

  return (
    <div className="flex h-screen bg-[#faf9f6] dark:bg-[#201e1c] text-[#4a403a] dark:text-[#e8e6e3] overflow-hidden font-sans selection:bg-[#dce2d3] selection:text-[#4a403a]">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        {/* Header (Mobile) */}
        <div className="md:hidden flex items-center p-4 bg-[#fffefb] dark:bg-[#2c2a27] border-b border-[#e6e2d3] dark:border-[#3e3b36]">
            <button onClick={() => setSidebarOpen(true)} className="p-2 mr-2 text-[#786b59]">
                <Menu size={24} />
            </button>
            <h1 className="font-bold text-[#4a403a] flex items-center gap-2">
                <Leaf size={18} className="text-[#739072]" /> Polyglot
            </h1>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'generate' && <Generator onArticleGenerated={handleArticleCreated} />}
          {activeTab === 'manual' && <ManualInput onArticleGenerated={handleArticleCreated} />}
          {activeTab === 'library' && (
              <LibraryView 
                onSelect={handleArticleCreated} 
              />
          )}
        </main>
      </div>
    </div>
  );
}