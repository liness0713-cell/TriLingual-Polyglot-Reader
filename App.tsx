import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Library, Settings, Menu, X, Download, Trash2, PlayCircle, Search, Leaf, Sparkles, Type, Globe, Newspaper, RefreshCw, MessageSquarePlus } from 'lucide-react';
import { Article, Difficulty, Genre, ArticleLength, Sentence, NewsProvider, NewsHeadline } from './types';
import { NEWS_PROVIDERS } from './data/newsProviders';
import * as GeminiService from './services/geminiService';
import * as StorageService from './services/storageService';
import ReactMarkdown from 'react-markdown';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

// --- 1. Sidebar Component ---
const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'press', icon: <Globe size={20} />, label: 'World Press' },
    { id: 'generate', icon: <PenTool size={20} />, label: 'AI Generator' },
    { id: 'manual', icon: <Settings size={20} />, label: 'Manual Input' },
    { id: 'library', icon: <Library size={20} />, label: 'My Library' },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-[#4a403a]/20 backdrop-blur-sm z-20 md:hidden" onClick={() => setIsOpen(false)} />
      )}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#f3f1eb] border-r border-[#d1cdc2] transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-8 border-b border-[#d1cdc2]">
          <h1 className="text-2xl font-bold text-[#4a403a] flex items-center gap-2 tracking-tighter">
            <Leaf size={24} className="text-[#739072]" /> Polyglot
          </h1>
        </div>
        <nav className="p-4 space-y-2 flex-1 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-[#739072] text-white shadow-md' 
                  : 'text-[#786b59] hover:bg-[#e6e2d3] hover:text-[#4a403a]'
              }`}
            >
              {item.icon}
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-[#d1cdc2] text-center">
            <a href="https://my-portfolio-beige-five-56.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-sm text-[#8c8279] hover:text-[#739072] transition-colors font-bold uppercase tracking-widest">
              <span>千葉２狗 🐶</span>
            </a>
        </div>
      </div>
    </>
  );
};

interface WorldPressProps {
  onArticleGenerated: (article: Article) => void;
}

// --- 2. WorldPress Component ---
const WorldPress: React.FC<WorldPressProps> = ({ onArticleGenerated }) => {
  const [selectedProvider, setSelectedProvider] = useState<NewsProvider | null>(null);
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingArticle, setProcessingArticle] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const categories = ['All', 'News', 'Finance', 'Tech', 'Fashion', 'Culture', 'Science', 'Travel', 'Food', 'Gaming', 'Design', 'Sports'];
  const filteredProviders = filter === 'All' ? NEWS_PROVIDERS : NEWS_PROVIDERS.filter(p => p.category === filter);

  const fetchHeadlines = async (provider: NewsProvider) => {
    setLoading(true);
    setHeadlines([]);
    setSelectedProvider(provider);
    try {
      const results = await GeminiService.fetchLatestHeadlines(provider.url);
      setHeadlines(results);
    } catch (e) { alert("Failed to fetch news."); } finally { setLoading(false); }
  };

  const handleHeadlineClick = async (headline: NewsHeadline) => {
    if (!selectedProvider) return;
    setProcessingArticle(headline.title);
    try {
      const content = await GeminiService.processNewsArticle(headline, selectedProvider.name);
      const newArticle: Article = { id: `news-${Date.now()}`, createdAt: Date.now(), ...content } as Article;
      StorageService.saveArticle(newArticle);
      onArticleGenerated(newArticle);
    } catch (e) { alert("Failed to process article."); } finally { setProcessingArticle(null); }
  };

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto animate-in fade-in duration-500">
      {!selectedProvider ? (
        <>
          <div className="flex flex-col mb-10">
            <h2 className="text-4xl font-bold text-[#4a403a] mb-2 tracking-tight">World Press</h2>
            <p className="text-[#8c8279] font-medium">Study with global prestige media in real-time.</p>
          </div>
          
          <div className="flex gap-2 mb-10 overflow-x-auto pb-4 no-scrollbar">
             {categories.map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setFilter(cat)} 
                 className={`px-5 py-2 rounded-full text-xs font-bold border-2 transition-all whitespace-nowrap ${
                   filter === cat 
                   ? 'bg-[#739072] text-white border-[#739072]' 
                   : 'bg-white text-[#786b59] border-[#e6e2d3] hover:border-[#739072]'
                 }`}
               >
                 {cat}
               </button>
             ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <div 
                key={provider.id} 
                onClick={() => fetchHeadlines(provider)} 
                className="bg-white p-6 rounded-2xl border border-[#e6e2d3] hover:border-[#739072] transition-all cursor-pointer flex flex-col h-full group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <span className="text-[9px] font-bold text-[#739072] border border-[#739072] px-2 py-0.5 rounded-full uppercase">{provider.region}</span>
                    <span className="text-[9px] font-bold text-[#8c8279] border border-[#d1cdc2] px-2 py-0.5 rounded-full uppercase">{provider.category}</span>
                  </div>
                  <Newspaper size={18} className="text-[#d1cdc2] group-hover:text-[#739072] transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-[#4a403a] mb-2 leading-tight group-hover:text-[#739072]">{provider.name}</h3>
                <p className="text-sm text-[#8c8279] mb-4 line-clamp-2 leading-relaxed">{provider.description}</p>
                <div className="text-[10px] font-mono mt-auto pt-4 border-t border-[#f0efeb] text-[#b5b0a8]">{provider.url}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
           <div className="flex items-center justify-between mb-8">
             <button onClick={() => setSelectedProvider(null)} className="font-bold text-[#739072] bg-[#f3f1eb] px-5 py-2 rounded-full hover:bg-[#e6e2d3] transition-colors">
               ← Publishers
             </button>
             <button onClick={() => fetchHeadlines(selectedProvider)} disabled={loading} className="p-2 bg-white border border-[#d1cdc2] rounded-full text-[#739072] hover:bg-[#f3f1eb] transition-all disabled:opacity-50">
               <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
             </button>
           </div>
           <h2 className="text-4xl font-bold text-[#4a403a] mb-8 border-b-2 border-[#d1cdc2] pb-4">{selectedProvider.name}</h2>
           {loading ? (
             <div className="py-24 text-center font-bold text-[#739072] animate-pulse">SYNCHRONIZING WITH AI AGENT...</div>
           ) : (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {headlines.map((headline, idx) => (
                 <div key={idx} onClick={() => handleHeadlineClick(headline)} className="bg-white p-8 rounded-3xl border border-[#e6e2d3] hover:border-[#739072] cursor-pointer group transition-all">
                   <h4 className="text-2xl font-bold text-[#4a403a] mb-4 leading-tight group-hover:text-[#739072]">{headline.title}</h4>
                   <p className="text-[#8c8279] line-clamp-3 mb-6 leading-relaxed">{headline.snippet}</p>
                   <div className="text-sm font-bold text-[#739072] uppercase flex items-center gap-2 tracking-widest"><Sparkles size={16} /> AI Study Ready</div>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}
      {processingArticle && (
        <div className="fixed inset-0 bg-[#efebe0]/95 z-[100] flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
          <div className="w-20 h-20 border-4 border-[#739072] border-t-transparent rounded-full animate-spin mb-8"></div>
          <h3 className="text-3xl font-bold text-[#4a403a] mb-2">Analyzing Content</h3>
          <p className="text-[#8c8279] font-medium">Extracting text and generating trilingual annotations...</p>
        </div>
      )}
    </div>
  );
};

interface GeneratorProps {
  onArticleGenerated: (article: Article) => void;
}

// --- 3. Generator Component ---
const Generator: React.FC<GeneratorProps> = ({ onArticleGenerated }) => {
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState<Genre>(Genre.DailyLife);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Intermediate);
  const [length, setLength] = useState<ArticleLength>(ArticleLength.Medium);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const content = await GeminiService.generateArticleContent(topic, genre, difficulty, length);
      const newArticle: Article = { id: Date.now().toString(), createdAt: Date.now(), genre, difficulty, ...content };
      StorageService.saveArticle(newArticle);
      onArticleGenerated(newArticle);
    } catch (e) { alert("Generation failed."); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-[#4a403a] mb-2">AI Generator</h2>
        <p className="text-[#8c8279] font-medium">Create custom trilingual learning material in seconds.</p>
      </div>
      
      <div className="space-y-10 bg-white p-10 rounded-3xl border border-[#e6e2d3]">
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[#739072] uppercase tracking-widest">Article Topic</label>
          <input 
            type="text" 
            placeholder="e.g. A mysterious journey in Hokkaido or The future of AI" 
            className="w-full px-6 py-5 rounded-2xl border-2 border-[#f3f1eb] bg-[#fcfcfc] outline-none font-bold text-[#4a403a] focus:border-[#739072] transition-all text-lg" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-[#739072] uppercase tracking-widest">Genre</label>
            <select className="w-full px-6 py-4 rounded-xl border-2 border-[#f3f1eb] bg-[#fcfcfc] outline-none font-bold text-[#4a403a] appearance-none cursor-pointer hover:border-[#d1cdc2]" value={genre} onChange={(e) => setGenre(e.target.value as Genre)}>
              {Object.values(Genre).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-bold text-[#739072] uppercase tracking-widest">Level</label>
            <select className="w-full px-6 py-4 rounded-xl border-2 border-[#f3f1eb] bg-[#fcfcfc] outline-none font-bold text-[#4a403a] appearance-none cursor-pointer hover:border-[#d1cdc2]" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
              {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-3">
            <label className="block text-sm font-bold text-[#739072] uppercase tracking-widest">Article Length</label>
            <select className="w-full px-6 py-4 rounded-xl border-2 border-[#f3f1eb] bg-[#fcfcfc] outline-none font-bold text-[#4a403a] appearance-none cursor-pointer hover:border-[#d1cdc2]" value={length} onChange={(e) => setLength(e.target.value as ArticleLength)}>
              {Object.values(ArticleLength).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
        </div>

        <button onClick={handleGenerate} disabled={loading} className="w-full py-6 bg-[#739072] text-white font-bold text-xl rounded-2xl hover:bg-[#5f7161] shadow-lg transition-all disabled:bg-[#d1cdc2] uppercase tracking-widest">
          {loading ? 'Manifesting Story...' : 'Generate Article'}
        </button>
      </div>
    </div>
  );
};

interface ManualInputProps {
  onArticleGenerated: (article: Article) => void;
}

// --- 4. Manual Input Component ---
const ManualInput: React.FC<ManualInputProps> = ({ onArticleGenerated }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const content = await GeminiService.parseManualInput(text);
      const newArticle: Article = { id: Date.now().toString(), createdAt: Date.now(), genre: 'Custom', difficulty: 'Manual', ...content };
      StorageService.saveArticle(newArticle);
      onArticleGenerated(newArticle);
    } catch (e) { alert("Parsing failed."); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-4xl font-bold text-[#4a403a] mb-8 tracking-tight">Manual Input</h2>
      <div className="bg-white p-10 rounded-3xl border border-[#e6e2d3] space-y-6">
        <textarea 
          placeholder="Paste foreign text here to analyze..." 
          className="w-full h-64 p-6 rounded-2xl border-2 border-[#f3f1eb] bg-[#fcfcfc] outline-none font-medium text-[#1a1a1a] resize-none focus:border-[#739072] transition-all text-lg" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
        />
        <button onClick={handleParse} disabled={loading || !text.trim()} className="w-full py-5 bg-[#8f5e5e] text-white font-bold text-lg rounded-2xl hover:bg-[#7a4f4f] transition-all uppercase tracking-widest">
          {loading ? 'Processing...' : 'Deep Analyze Text'}
        </button>
      </div>
    </div>
  );
};

interface ReaderProps {
  article: Article;
  onBack: () => void;
  onUpdate: (updated: Article) => void;
}

// --- 5. Reader Component ---
const Reader: React.FC<ReaderProps> = ({ article, onBack, onUpdate }) => {
  const [selectedSentence, setSelectedSentence] = useState<Sentence | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showRuby, setShowRuby] = useState(true);
  const [fontSizeLevel, setFontSizeLevel] = useState(1);
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
        onUpdate({ ...article, sentences: [...article.sentences, ...newSentences] });
        setContinuationPrompt("");
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch (e) { alert("Extension failed."); } finally { setIsExtending(false); }
  }

  const getFontSizeClass = (level: number) => {
      switch(level) {
          case 0: return "text-lg";
          case 1: return "text-xl"; 
          case 2: return "text-2xl";
          case 3: return "text-3xl";
          case 4: return "text-4xl leading-snug";
          case 5: return "text-5xl leading-tight";
          default: return level > 5 ? "text-5xl" : "text-xl";
      }
  }

  const getSecondaryFontSizeClass = (level: number) => {
    switch(level) {
        case 0: return "text-base";
        case 1: return "text-lg"; 
        case 2: return "text-xl";
        case 3: return "text-2xl";
        case 4: return "text-3xl font-bold";
        default: return "text-lg";
    }
  }

  const getEnglishFontSizeClass = (level: number) => {
    switch(level) {
        case 0: return "text-lg";
        case 1: return "text-xl font-bold"; 
        case 2: return "text-2xl font-bold";
        case 3: return "text-3xl font-black";
        case 4: return "text-4xl font-black leading-tight";
        default: return "text-xl font-bold";
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#efebe0] text-[#1a1a1a]">
      {/* Reader Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#d1cdc2] bg-[#f3f1eb] shrink-0 z-10 shadow-sm">
        <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 bg-white border border-[#d1cdc2] rounded-full hover:bg-[#e6e2d3] transition-colors"><X size={20} /></button>
            <h2 className="font-bold text-[#4a403a] truncate max-w-xs md:max-w-md">
               {article.title.ja}
            </h2>
        </div>
        <div className="flex items-center space-x-3">
           <div className="flex items-center space-x-1 border border-[#d1cdc2] rounded-full p-1 bg-white">
                <button onClick={() => setFontSizeLevel(Math.max(0, fontSizeLevel - 1))} className="p-2 hover:bg-[#f3f1eb] rounded-full"><Type size={14}/></button>
                <button onClick={() => setFontSizeLevel(Math.min(4, fontSizeLevel + 1))} className="p-2 hover:bg-[#f3f1eb] rounded-full"><Type size={20}/></button>
           </div>
           <button onClick={() => setShowRuby(!showRuby)} className={`px-4 py-2 text-xs font-bold rounded-full border ${showRuby ? 'bg-[#739072] text-white border-[#739072]' : 'text-[#739072] border-[#739072] hover:bg-[#f3f1eb]'}`}>RUBY</button>
           <button onClick={() => StorageService.exportToCSV(article)} className="p-2 bg-white border border-[#d1cdc2] rounded-full text-[#739072]"><Download size={20}/></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-20 pb-32">
            {/* Article Heading */}
            <div className="max-w-4xl mx-auto text-center space-y-12 border-b border-[#e6e2d3] pb-16">
                <h1 className={`font-bold leading-tight ${getFontSizeClass(fontSizeLevel + 1)} transition-all duration-200`}>
                    {showRuby && article.title.ja_ruby ? <span dangerouslySetInnerHTML={{__html: article.title.ja_ruby}} /> : article.title.ja}
                </h1>
                <div className="space-y-10">
                    <p className={`font-medium text-[#786b59] ${getSecondaryFontSizeClass(fontSizeLevel)}`}>{article.title.zh}</p>
                    <p className={`text-[#1a1a1a] ${getEnglishFontSizeClass(fontSizeLevel)}`}>{article.title.en}</p>
                </div>
            </div>

            {/* Content Body */}
            <div className="space-y-12 max-w-4xl mx-auto">
                {article.sentences.map((s: Sentence) => (
                    <div 
                      key={s.id} 
                      onClick={() => { setSelectedSentence(s); setAnalysis(null); }} 
                      className={`p-12 md:p-16 rounded-3xl border-2 transition-all cursor-pointer ${selectedSentence?.id === s.id ? 'bg-white border-[#739072] shadow-md' : 'bg-transparent border-transparent hover:bg-white/50 hover:border-[#e6e2d3]'}`}
                    >
                        <div className={`${getFontSizeClass(fontSizeLevel)} font-bold mb-14 leading-relaxed`}>
                           {showRuby ? <span dangerouslySetInnerHTML={{__html: s.ja_ruby}} /> : <span>{s.ja}</span>}
                        </div>
                        <div className="space-y-12 border-t border-[#f3f1eb] pt-14">
                             <p className={`${getFontSizeClass(fontSizeLevel - 1)} font-medium text-[#5c524b]`}>{s.zh}</p>
                             <p className={`${getEnglishFontSizeClass(fontSizeLevel - 1)} text-[#1a1a1a]`}>{s.en}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Article Extension Section */}
            <div className="max-w-4xl mx-auto pt-16 border-t border-[#e6e2d3]">
                <div className="bg-white p-8 rounded-3xl border-2 border-[#f3f1eb]">
                    <h3 className="text-xl font-bold text-[#4a403a] mb-4 flex items-center gap-2">
                        <MessageSquarePlus size={24} className="text-[#739072]" /> Continue this Story
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4">
                        <textarea 
                          disabled={isExtending} 
                          value={continuationPrompt} 
                          onChange={(e) => setContinuationPrompt(e.target.value)} 
                          placeholder="What happens next? (Optional: provide keywords or let AI decide...)" 
                          className="flex-1 px-5 py-4 rounded-2xl border-2 border-[#f3f1eb] bg-[#fcfcfc] text-[#1a1a1a] outline-none h-24 focus:border-[#739072] transition-all font-medium" 
                        />
                        <button 
                          onClick={handleExtendStory} 
                          disabled={isExtending} 
                          className="px-8 py-4 rounded-2xl font-bold text-white bg-[#739072] hover:bg-[#5f7161] disabled:bg-[#d1cdc2] shadow-md transition-all whitespace-nowrap self-end md:self-stretch uppercase tracking-widest text-sm"
                        >
                          {isExtending ? 'Generating...' : 'Append'}
                        </button>
                    </div>
                </div>
            </div>
            <div ref={scrollRef}></div>
        </div>

        {/* Analysis Sidebar */}
        {selectedSentence && (
            <div className="absolute top-0 right-0 h-full w-full md:w-[480px] bg-white border-l-2 border-[#d1cdc2] z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 border-b border-[#d1cdc2] bg-[#f3f1eb]">
                    <span className="font-bold text-[#4a403a] uppercase tracking-widest flex items-center gap-2"><Search size={20} className="text-[#739072]"/> Sentence Analysis</span>
                    <button onClick={() => setSelectedSentence(null)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    <div className="space-y-6 bg-[#faf9f6] p-6 rounded-2xl border border-[#e6e2d3]">
                        <div className="space-y-1">
                           <span className="text-[10px] font-bold text-[#739072] uppercase tracking-tighter">Japanese</span>
                           <div className="text-xl font-bold leading-relaxed">
                               {showRuby ? <span dangerouslySetInnerHTML={{__html: selectedSentence.ja_ruby}} /> : selectedSentence.ja}
                           </div>
                        </div>
                        <div className="space-y-1">
                           <span className="text-[10px] font-bold text-[#739072] uppercase tracking-tighter">Chinese</span>
                           <p className="font-medium text-[#4a403a]">{selectedSentence.zh}</p>
                        </div>
                        <div className="space-y-1">
                           <span className="text-[10px] font-bold text-[#739072] uppercase tracking-tighter">English</span>
                           <p className="font-bold text-[#1a1a1a] leading-tight text-lg">{selectedSentence.en}</p>
                        </div>
                    </div>

                    <div className="flex justify-around items-center border-y border-[#f3f1eb] py-4">
                         {['ja-JP', 'zh-CN', 'en-US'].map((lang, i) => (
                           <button 
                             key={lang} 
                             onClick={() => speak([selectedSentence.ja, selectedSentence.zh, selectedSentence.en][i], lang)} 
                             className="flex flex-col items-center group"
                           >
                              <div className="p-3 bg-[#f3f1eb] group-hover:bg-[#739072] group-hover:text-white rounded-full mb-1 transition-all"><PlayCircle size={24} /></div>
                              <span className="text-[10px] font-bold uppercase">{['JP','CN','EN'][i]}</span>
                           </button>
                         ))}
                    </div>

                    <div className="prose prose-stone max-w-none">
                         {!analysis && !analyzing ? (
                             <button onClick={() => handleAnalyze(selectedSentence)} className="w-full py-5 bg-[#739072] text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-[#5f7161] shadow-lg transition-all">Deep Analysis</button>
                         ) : (
                             <div className="text-[#1a1a1a] leading-relaxed">
                                  {analyzing ? <div className="animate-pulse flex flex-col gap-4">
                                      <div className="h-4 bg-[#f3f1eb] rounded w-3/4"></div>
                                      <div className="h-4 bg-[#f3f1eb] rounded w-full"></div>
                                      <div className="h-4 bg-[#f3f1eb] rounded w-5/6"></div>
                                  </div> : <ReactMarkdown>{analysis || ''}</ReactMarkdown>}
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

interface LibraryViewProps {
  onSelect: (article: Article) => void;
}

// --- 6. Library Component ---
const LibraryView: React.FC<LibraryViewProps> = ({ onSelect }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  useEffect(() => { setArticles(StorageService.getSavedArticles()); }, []);
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm("Permanently delete this article from your library?")) {
        StorageService.deleteArticle(id);
        setArticles(StorageService.getSavedArticles());
    }
  }
  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-4xl font-bold text-[#4a403a] mb-10 tracking-tight">My Library</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.length > 0 ? articles.map((article: Article) => (
          <div key={article.id} onClick={() => onSelect(article)} className="bg-white p-8 rounded-3xl border border-[#e6e2d3] hover:border-[#739072] cursor-pointer relative group transition-all">
            <h3 className="text-2xl font-bold text-[#4a403a] mb-2 truncate group-hover:text-[#739072]">{article.title.ja}</h3>
            <p className="text-sm font-bold text-[#8c8279] mb-4 truncate">{article.title.en}</p>
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold border border-[#d1cdc2] px-3 py-1 rounded-full uppercase text-[#b5b0a8]">{article.genre}</span>
                <span className="text-[10px] font-bold text-[#b5b0a8]">{article.sentences.length} Sentences</span>
            </div>
            <button onClick={(e) => handleDelete(e, article.id)} className="absolute top-6 right-6 p-2 text-[#d1cdc2] hover:text-[#8f5e5e] transition-colors"><Trash2 size={20} /></button>
          </div>
        )) : (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-[#d1cdc2] rounded-3xl bg-white/50">
                <Library size={64} className="mx-auto text-[#d1cdc2] mb-6" />
                <p className="text-xl font-bold text-[#8c8279]">Your collection is empty.</p>
                <p className="text-[#b5b0a8]">Generate an article or input text to get started.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('press');
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleArticleCreated = (article: Article) => { setCurrentArticle(article); };
  const handleArticleUpdated = (updatedArticle: Article) => {
    setCurrentArticle(updatedArticle);
    StorageService.saveArticle(updatedArticle);
  };

  if (currentArticle) {
      return (
        <div className="h-screen bg-[#efebe0]">
          <Reader article={currentArticle} onBack={() => setCurrentArticle(null)} onUpdate={handleArticleUpdated} />
        </div>
      );
  }

  return (
    <div className="flex h-screen bg-[#efebe0] text-[#1a1a1a] overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <div className="md:hidden flex items-center p-4 bg-[#f3f1eb] border-b border-[#d1cdc2]">
            <button onClick={() => setSidebarOpen(true)} className="p-2 mr-3 bg-white border border-[#d1cdc2] rounded-full text-[#739072] shadow-sm"><Menu size={24} /></button>
            <h1 className="font-bold text-[#4a403a] tracking-tight flex items-center gap-2"><Leaf size={20} className="text-[#739072]" /> Polyglot</h1>
        </div>
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'press' && <WorldPress onArticleGenerated={handleArticleCreated} />}
          {activeTab === 'generate' && <Generator onArticleGenerated={handleArticleCreated} />}
          {activeTab === 'manual' && <ManualInput onArticleGenerated={handleArticleCreated} />}
          {activeTab === 'library' && <LibraryView onSelect={handleArticleCreated} />}
        </main>
      </div>
    </div>
  );
}
