import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Library, Settings, Menu, X, Download, Trash2, PlayCircle, Search, Leaf, Sparkles, Type, Globe, Newspaper, RefreshCw, MessageSquarePlus } from 'lucide-react';
import { Article, Difficulty, Genre, ArticleLength, Sentence, NewsProvider, NewsHeadline } from './types';
import * as GeminiService from './services/geminiService';
import * as StorageService from './services/storageService';
import ReactMarkdown from 'react-markdown';

// --- ULTIMATE NEWS PROVIDERS CONFIGURATION (EXTENDED) ---
const NEWS_PROVIDERS: NewsProvider[] = [
  // --- JAPAN (45+ SOURCES) ---
  { id: 'yomiuri', name: 'Yomiuri Shimbun (読売新聞)', url: 'yomiuri.co.jp', category: 'News', region: 'Japan', description: 'Highest circulation globally.' },
  { id: 'asahi', name: 'Asahi Shimbun (朝日新聞)', url: 'asahi.com', category: 'News', region: 'Japan', description: 'Progressive national newspaper.' },
  { id: 'mainichi', name: 'Mainichi Shimbun (毎日新聞)', url: 'mainichi.jp', category: 'News', region: 'Japan', description: 'Long-standing national paper.' },
  { id: 'nikkei', name: 'Nikkei (日本经济新闻)', url: 'nikkei.com', category: 'Finance', region: 'Japan', description: 'Business daily.' },
  { id: 'sankei', name: 'Sankei Shimbun (産経新聞)', url: 'sankei.com', category: 'News', region: 'Japan', description: 'Conservative national daily.' },
  { id: 'nhk', name: 'NHK News', url: 'www3.nhk.or.jp/news/', category: 'News', region: 'Japan', description: 'Public broadcaster.' },
  { id: 'kyodo', name: 'Kyodo News (共同通信)', url: 'kyodonews.net', category: 'News', region: 'Japan', description: 'Major news agency.' },
  { id: 'jiji', name: 'Jiji Press (时事通信)', url: 'jiji.com', category: 'News', region: 'Japan', description: 'Global news agency.' },
  { id: 'tokyo-np', name: 'Tokyo Shimbun (东京新闻)', url: 'tokyo-np.co.jp', category: 'News', region: 'Japan', description: 'Leading regional daily.' },
  { id: 'japantimes', name: 'The Japan Times', url: 'japantimes.co.jp', category: 'News', region: 'Japan', description: 'English daily.' },
  { id: 'toyokeizai', name: 'Toyo Keizai (东洋经济)', url: 'toyokeizai.net', category: 'Finance', region: 'Japan', description: 'Economic analysis.' },
  { id: 'diamond', name: 'Diamond Online', url: 'diamond.jp', category: 'Finance', region: 'Japan', description: 'Management insights.' },
  { id: 'huffpost-jp', name: 'HuffPost Japan', url: 'huffingtonpost.jp', category: 'News', region: 'Japan', description: 'Digital news.' },
  { id: 'buzzfeed-jp', name: 'BuzzFeed Japan', url: 'buzzfeed.com/jp', category: 'Culture', region: 'Japan', description: 'Pop culture & news.' },
  { id: 'newsweek-jp', name: 'Newsweek Japan', url: 'newsweekjapan.jp', category: 'News', region: 'Japan', description: 'International news.' },
  { id: 'gendai', name: 'Gendai Business (现代ビジネス)', url: 'gendai.ismedia.jp', category: 'Finance', region: 'Japan', description: 'Business & lifestyle.' },
  { id: 'president', name: 'President Online', url: 'president.jp', category: 'Finance', region: 'Japan', description: 'Leadership & economy.' },
  { id: 'courrier-jp', name: 'Courrier Japon', url: 'courrier.jp', category: 'Culture', region: 'Japan', description: 'Global perspective in Japanese.' },
  { id: 'wired-jp', name: 'WIRED Japan', url: 'wired.jp', category: 'Tech', region: 'Japan', description: 'Tech & culture.' },
  { id: 'gizmodo-jp', name: 'Gizmodo Japan', url: 'gizmodo.jp', category: 'Tech', region: 'Japan', description: 'Gadget & future.' },
  { id: 'fnn', name: 'FNN Prime Online', url: 'fnn.jp', category: 'News', region: 'Japan', description: 'Fuji News Network.' },
  { id: 'tbs-news', name: 'TBS NEWS DIG', url: 'newsdig.tbs.co.jp', category: 'News', region: 'Japan', description: 'TBS news portal.' },
  { id: 'abema', name: 'ABEMA Times', url: 'times.abema.tv', category: 'News', region: 'Japan', description: 'Internet news.' },
  { id: 'nikkan-sports', name: 'Nikkan Sports (日刊スポーツ)', url: 'nikkansports.com', category: 'Sports', region: 'Japan', description: 'Leading sports daily.' },
  { id: 'sports-hochi', name: 'Sports Hochi (スポーツ報知)', url: 'hochi.news', category: 'Sports', region: 'Japan', description: 'Entertainment and sports.' },
  { id: 'daily-sports', name: 'Daily Sports (デイリースポーツ)', url: 'daily.co.jp', category: 'Sports', region: 'Japan', description: 'Kansai-based sports daily.' },
  { id: 'kyoto-np', name: 'Kyoto Shimbun (京都新聞)', url: 'kyoto-np.co.jp', category: 'News', region: 'Japan', description: 'Voices from the ancient capital.' },
  { id: 'kobe-np', name: 'Kobe Shimbun (神戸新聞)', url: 'kobe-np.co.jp', category: 'News', region: 'Japan', description: 'Hyogo prefecture voice.' },
  { id: 'ryukyu', name: 'Ryukyu Shimpo (琉球新報)', url: 'ryukyushimpo.jp', category: 'News', region: 'Japan', description: 'Major Okinawan paper.' },
  { id: 'itmedia', name: 'ITmedia', url: 'itmedia.co.jp', category: 'Tech', region: 'Japan', description: 'Largest tech news site.' },
  { id: 'ascii', name: 'ASCII.jp', url: 'ascii.jp', category: 'Tech', region: 'Japan', description: 'Digital & gadget hub.' },
  { id: 'watch-impress', name: 'Impress Watch', url: 'watch.impress.co.jp', category: 'Tech', region: 'Japan', description: 'Expert tech reviews.' },
  { id: 'pen-online', name: 'Pen Online', url: 'pen-online.jp', category: 'Culture', region: 'Japan', description: 'Art, design & architecture.' },
  { id: 'casa-brutus', name: 'Casa BRUTUS', url: 'casabrutus.com', category: 'Design', region: 'Japan', description: 'Architecture & lifestyle.' },
  { id: 'fudge', name: 'FUDGE.jp', url: 'fudge.jp', category: 'Fashion', region: 'Japan', description: 'London-style fashion.' },
  { id: 'ginza', name: 'GINZA', url: 'ginzamag.com', category: 'Fashion', region: 'Japan', description: 'High-end fashion culture.' },
  { id: 'elle-jp', name: 'Elle Japan', url: 'elle.com/jp', category: 'Fashion', region: 'Japan', description: 'Women\'s fashion daily.' },
  { id: 'famitsu', name: 'Famitsu (ファミ通)', url: 'famitsu.com', category: 'Gaming', region: 'Japan', description: 'Legendary gaming magazine.' },
  { id: '4gamer', name: '4Gamer.net', url: '4gamer.net', category: 'Gaming', region: 'Japan', description: 'Hardcore gaming news.' },
  { id: 'dengeki', name: 'Dengeki Online (電撃オンライン)', url: 'dengekionline.com', category: 'Gaming', region: 'Japan', description: 'Anime & game news.' },
  { id: 'ign-jp', name: 'IGN Japan', url: 'jp.ign.com', category: 'Gaming', region: 'Japan', description: 'Global gaming authority in JP.' },
  { id: 'fashionsnap', name: 'FASHIONSNAP', url: 'fashionsnap.com', category: 'Fashion', region: 'Japan', description: 'Leading fashion web media.' },
  { id: 'wwd-jp', name: 'WWD Japan', url: 'wwdjapan.com', category: 'Fashion', region: 'Japan', description: 'Fashion business daily.' },
  { id: 'spoon-tamago', name: 'Spoon & Tamago', url: 'spoon-tamago.com', category: 'Design', region: 'Japan', description: 'Japanese art & design.' },

  // --- JAPAN ADDITIONAL ---
  { id: 'chunichi', name: 'Chunichi Shimbun (中日新聞)', url: 'chunichi.co.jp', category: 'News', region: 'Japan', description: 'Major Chubu region newspaper.' },
  { id: 'nishinippon', name: 'Nishinippon Shimbun (西日本新闻)', url: 'nishinippon.co.jp', category: 'News', region: 'Japan', description: 'Leading Kyushu daily.' },
  { id: 'hokkaido', name: 'Hokkaido Shimbun (北海道新聞)', url: 'hokkaido-np.co.jp', category: 'News', region: 'Japan', description: 'Hokkaido\'s largest paper.' },
  { id: 'shizuoka', name: 'Shizuoka Shimbun (静岡新聞)', url: 'at-s.com', category: 'News', region: 'Japan', description: 'Shizuoka regional voice.' },
  { id: 'chugoku', name: 'Chugoku Shimbun (中国新聞)', url: 'chugoku-np.co.jp', category: 'News', region: 'Japan', description: 'Hiroshima-based regional paper.' },
  { id: 'bunshun', name: 'Bunshun Online (文春オンライン)', url: 'bunshun.jp', category: 'Culture', region: 'Japan', description: 'Influential weekly magazine online.' },
  { id: 'shinchosha', name: 'Shincho (新潮)', url: 'shinchosha.co.jp', category: 'Culture', region: 'Japan', description: 'Literary and cultural magazine.' },
  { id: 'fujin-koron', name: 'Fujin Koron (婦人公論)', url: 'fujinkoron.jp', category: 'Culture', region: 'Japan', description: 'Women\'s lifestyle magazine.' },
  { id: 'spa', name: 'SPA!', url: 'nikkan-spa.jp', category: 'Culture', region: 'Japan', description: 'Men\'s lifestyle weekly.' },
  { id: 'aera', name: 'AERA dot.', url: 'dot.asahi.com/aera/', category: 'News', region: 'Japan', description: 'Asahi\'s weekly newsmagazine.' },
  { id: 'nikkei-xtech', name: 'Nikkei xTECH', url: 'xtech.nikkei.com', category: 'Tech', region: 'Japan', description: 'Business tech from Nikkei.' },
  { id: 'nikkei-bp', name: 'Nikkei BP', url: 'nikkeibp.co.jp', category: 'Finance', region: 'Japan', description: 'Nikkei business publishing.' },
  { id: 'weekly-diamond', name: 'Weekly Diamond (週刊ダイヤモンド)', url: 'diamond.jp/list/magazine', category: 'Finance', region: 'Japan', description: 'Top business weekly.' },
  { id: 'weekly-toyo', name: 'Weekly Toyo Keizai (週刊東洋経済)', url: 'toyokeizai.net/list/magazine', category: 'Finance', region: 'Japan', description: 'Economic weekly magazine.' },
  { id: 'nikkei-business', name: 'Nikkei Business', url: 'business.nikkei.com', category: 'Finance', region: 'Japan', description: 'Premier business magazine.' },
  { id: 'sports-nippon', name: 'Sports Nippon (スポニチ)', url: 'sponichi.co.jp', category: 'Sports', region: 'Japan', description: 'Sports & entertainment daily.' },
  { id: 'sanspo', name: 'Sanspo (サンスポ)', url: 'sanspo.com', category: 'Sports', region: 'Japan', description: 'Sankei sports paper.' },
  { id: 'number', name: 'Number Web', url: 'number.bunshun.jp', category: 'Sports', region: 'Japan', description: 'Premium sports magazine.' },
  { id: 'soccer-king', name: 'Soccer King (サッカーキング)', url: 'soccer-king.jp', category: 'Sports', region: 'Japan', description: 'Football news authority.' },
  { id: 'baseball-king', name: 'Baseball King', url: 'baseballking.jp', category: 'Sports', region: 'Japan', description: 'Professional baseball coverage.' },
  { id: 'vogue-jp', name: 'Vogue Japan', url: 'vogue.co.jp', category: 'Fashion', region: 'Japan', description: 'International fashion authority.' },
  { id: 'gq-jp', name: 'GQ Japan', url: 'gqjapan.jp', category: 'Fashion', region: 'Japan', description: 'Men\'s style & culture.' },
  { id: 'popeye', name: 'Popeye Magazine', url: 'popeye.magazine.co.jp', category: 'Fashion', region: 'Japan', description: 'City boy culture magazine.' },
  { id: 'brutus', name: 'BRUTUS', url: 'brutus.jp', category: 'Culture', region: 'Japan', description: 'Lifestyle & culture magazine.' },
  { id: 'hanako', name: 'Hanako', url: 'hanako.tokyo', category: 'Culture', region: 'Japan', description: 'Tokyo lifestyle guide.' },
  { id: 'timeout-jp', name: 'Time Out Japan', url: 'timeout.jp', category: 'Culture', region: 'Japan', description: 'Urban culture guide.' },
  { id: 'cinra', name: 'CINRA.NET', url: 'cinra.net', category: 'Culture', region: 'Japan', description: 'Art & culture web magazine.' },
  { id: 'natalie', name: 'Natalie (ナタリー)', url: 'natalie.mu', category: 'Culture', region: 'Japan', description: 'Pop culture news portal.' },
  { id: 'oricon', name: 'Oricon News', url: 'oricon.co.jp', category: 'Culture', region: 'Japan', description: 'Entertainment rankings & news.' },
  { id: 'animate', name: 'Animate Times', url: 'animatetimes.com', category: 'Culture', region: 'Japan', description: 'Anime news & culture.' },
  { id: 'akiba-souken', name: 'Akiba Souken (あきば総研)', url: 'akiba-souken.com', category: 'Culture', region: 'Japan', description: 'Anime & otaku culture.' },
  { id: 'eiga-com', name: 'Eiga.com (映画.com)', url: 'eiga.com', category: 'Culture', region: 'Japan', description: 'Movie news & reviews.' },
  { id: 'av-watch', name: 'AV Watch', url: 'av.watch.impress.co.jp', category: 'Tech', region: 'Japan', description: 'Audio-visual tech news.' },
  { id: 'pc-watch', name: 'PC Watch', url: 'pc.watch.impress.co.jp', category: 'Tech', region: 'Japan', description: 'PC hardware reviews.' },
  { id: 'game-watch', name: 'Game Watch', url: 'game.watch.impress.co.jp', category: 'Gaming', region: 'Japan', description: 'Game hardware & reviews.' },
  { id: 'inside-games', name: 'INSIDE Games', url: 'inside-games.jp', category: 'Gaming', region: 'Japan', description: 'Gaming industry news.' },
  { id: 'gamer', name: 'Gamer', url: 'gamer.ne.jp', category: 'Gaming', region: 'Japan', description: 'Game news & features.' },
  { id: 'ogiri', name: 'Ogiri JP (おぎりJP)', url: 'ogiri.jp', category: 'Design', region: 'Japan', description: 'Creative design showcase.' },
  { id: 'axis-mag', name: 'AXIS Magazine', url: 'axismag.jp', category: 'Design', region: 'Japan', description: 'Design & architecture quarterly.' },
  { id: 'commercial-photo', name: 'Commercial Photo', url: 'commercial-photo.com', category: 'Design', region: 'Japan', description: 'Professional photography magazine.' },
  { id: 'travel-jp', name: 'Travel.jp', url: 'travel.co.jp', category: 'Travel', region: 'Japan', description: 'Comprehensive travel portal.' },
  { id: 'rurubu', name: 'Rurubu (るるぶ)', url: 'rurubu.jp', category: 'Travel', region: 'Japan', description: 'Popular travel guide series.' },
  { id: 'retrip', name: 'RETRIP', url: 'retrip.jp', category: 'Travel', region: 'Japan', description: 'Travel discovery platform.' },

  // --- GLOBAL / WESTERN ---
  { id: 'bbc', name: 'BBC News', url: 'bbc.com/news', category: 'News', region: 'Global', description: 'British public broadcaster.' },
  { id: 'cnn', name: 'CNN', url: 'cnn.com', category: 'News', region: 'Global', description: 'Global news leader.' },
  { id: 'nytimes', name: 'The New York Times', url: 'nytimes.com', category: 'News', region: 'Global', description: 'The Gray Lady.' },
  { id: 'wapo', name: 'Washington Post', url: 'washingtonpost.com', category: 'News', region: 'Global', description: 'Democracy Dies in Darkness.' },
  { id: 'guardian', name: 'The Guardian', url: 'theguardian.com', category: 'News', region: 'Global', description: 'Independent UK voice.' },
  { id: 'reuters', name: 'Reuters', url: 'reuters.com', category: 'News', region: 'Global', description: 'World-leading agency.' },
  { id: 'ap', name: 'AP News', url: 'apnews.com', category: 'News', region: 'Global', description: 'The gold standard.' },
  { id: 'wsj', name: 'Wall Street Journal', url: 'wsj.com', category: 'Finance', region: 'Global', description: 'Finance & markets.' },
  { id: 'ft', name: 'Financial Times', url: 'ft.com', category: 'Finance', region: 'Global', description: 'Pink paper from London.' },
  { id: 'bloomberg', name: 'Bloomberg', url: 'bloomberg.com', category: 'Finance', region: 'Global', description: 'Market intelligence.' },
  { id: 'economist', name: 'The Economist', url: 'economist.com', category: 'Finance', region: 'Global', description: 'In-depth analysis.' },
  { id: 'time', name: 'TIME', url: 'time.com', category: 'News', region: 'Global', description: 'Weekly authority.' },
  { id: 'wired', name: 'WIRED', url: 'wired.com', category: 'Tech', region: 'Global', description: 'Future tech & culture.' },
  { id: 'verge', name: 'The Verge', url: 'theverge.com', category: 'Tech', region: 'Global', description: 'Consumer tech & art.' },
  { id: 'vogue', name: 'Vogue', url: 'vogue.com', category: 'Fashion', region: 'Global', description: 'High fashion.' },
  { id: 'bof', name: 'Business of Fashion', url: 'businessoffashion.com', category: 'Fashion', region: 'Global', description: 'The fashion industry bible.' },
  { id: 'wwd', name: 'WWD', url: 'wwd.com', category: 'Fashion', region: 'Global', description: 'Women\'s Wear Daily.' },
  { id: 'hypebeast', name: 'Hypebeast', url: 'hypebeast.com', category: 'Fashion', region: 'Global', description: 'Streetwear culture.' },
  { id: 'highsnobiety', name: 'Highsnobiety', url: 'highsnobiety.com', category: 'Fashion', region: 'Global', description: 'Lifestyle & fashion.' },
  { id: 'ign', name: 'IGN', url: 'ign.com', category: 'Gaming', region: 'Global', description: 'Gaming & entertainment.' },
  { id: 'polygon', name: 'Polygon', url: 'polygon.com', category: 'Gaming', region: 'Global', description: 'Gaming culture & news.' },
  { id: 'gamesradar', name: 'GamesRadar+', url: 'gamesradar.com', category: 'Gaming', region: 'Global', description: 'Gaming, movies, TV.' },
  { id: 'eurogamer', name: 'Eurogamer', url: 'eurogamer.net', category: 'Gaming', region: 'Global', description: 'European gaming giant.' },
  { id: 'pcgamer', name: 'PC Gamer', url: 'pcgamer.com', category: 'Gaming', region: 'Global', description: 'The PC gaming authority.' },
  { id: 'kotaku', name: 'Kotaku', url: 'kotaku.com', category: 'Gaming', region: 'Global', description: 'Games and culture.' },
  { id: 'archdigest', name: 'Architectural Digest', url: 'architecturaldigest.com', category: 'Design', region: 'Global', description: 'Interior design authority.' },
  { id: 'wallpaper', name: 'Wallpaper*', url: 'wallpaper.com', category: 'Design', region: 'Global', description: 'Design, fashion, art.' },
  { id: 'design-milk', name: 'Design Milk', url: 'design-milk.com', category: 'Design', region: 'Global', description: 'Modern design blog.' },
  { id: 'dezeen', name: 'Dezeen', url: 'dezeen.com', category: 'Design', region: 'Global', description: 'Architecture & interiors.' },
  { id: 'archdaily', name: 'ArchDaily', url: 'archdaily.com', category: 'Design', region: 'Global', description: 'Architecture hub.' },
  { id: 'monocle', name: 'Monocle', url: 'monocle.com', category: 'Culture', region: 'Global', description: 'Urban affairs & design.' },
  { id: 'newyorker', name: 'The New Yorker', url: 'newyorker.com', category: 'Culture', region: 'Global', description: 'Deep essays & fiction.' },
  { id: 'natgeo', name: 'National Geographic', url: 'nationalgeographic.com', category: 'Science', region: 'Global', description: 'Science & exploration.' },
  { id: 'techcrunch', name: 'TechCrunch', url: 'techcrunch.com', category: 'Tech', region: 'Global', description: 'Startup news.' },

  // --- GLOBAL / WESTERN ADDITIONAL ---
  { id: 'npr', name: 'NPR', url: 'npr.org', category: 'News', region: 'Global', description: 'American public radio network.' },
  { id: 'atlantic', name: 'The Atlantic', url: 'theatlantic.com', category: 'News', region: 'Global', description: 'Long-form journalism & analysis.' },
  { id: 'politico', name: 'Politico', url: 'politico.com', category: 'News', region: 'Global', description: 'Political journalism.' },
  { id: 'axios', name: 'Axios', url: 'axios.com', category: 'News', region: 'Global', description: 'Smart brevity news.' },
  { id: 'vice', name: 'VICE', url: 'vice.com', category: 'News', region: 'Global', description: 'Youth-oriented news & culture.' },
  { id: 'vox', name: 'Vox', url: 'vox.com', category: 'News', region: 'Global', description: 'Explanatory journalism.' },
  { id: 'buzzfeed', name: 'BuzzFeed News', url: 'buzzfeednews.com', category: 'News', region: 'Global', description: 'Digital news & investigations.' },
  { id: 'propublica', name: 'ProPublica', url: 'propublica.org', category: 'News', region: 'Global', description: 'Investigative journalism nonprofit.' },
  { id: 'independent', name: 'The Independent', url: 'independent.co.uk', category: 'News', region: 'Global', description: 'UK online newspaper.' },
  { id: 'telegraph', name: 'The Telegraph', url: 'telegraph.co.uk', category: 'News', region: 'Global', description: 'British broadsheet.' },
  { id: 'times-uk', name: 'The Times (UK)', url: 'thetimes.co.uk', category: 'News', region: 'Global', description: 'British newspaper of record.' },
  { id: 'usa-today', name: 'USA Today', url: 'usatoday.com', category: 'News', region: 'Global', description: 'National American daily.' },
  { id: 'latimes', name: 'Los Angeles Times', url: 'latimes.com', category: 'News', region: 'Global', description: 'West Coast major daily.' },
  { id: 'sfchronicle', name: 'San Francisco Chronicle', url: 'sfchronicle.com', category: 'News', region: 'Global', description: 'Bay Area daily newspaper.' },
  { id: 'chicago-tribune', name: 'Chicago Tribune', url: 'chicagotribune.com', category: 'News', region: 'Global', description: 'Midwest leading daily.' },
  { id: 'boston-globe', name: 'Boston Globe', url: 'bostonglobe.com', category: 'News', region: 'Global', description: 'New England\'s largest daily.' },
  { id: 'miami-herald', name: 'Miami Herald', url: 'miamiherald.com', category: 'News', region: 'Global', description: 'Florida major newspaper.' },
  { id: 'newsweek', name: 'Newsweek', url: 'newsweek.com', category: 'News', region: 'Global', description: 'Weekly news magazine.' },
  { id: 'usnews', name: 'U.S. News & World Report', url: 'usnews.com', category: 'News', region: 'Global', description: 'News analysis & rankings.' },
  { id: 'forbes', name: 'Forbes', url: 'forbes.com', category: 'Finance', region: 'Global', description: 'Business & billionaires.' },
  { id: 'fortune', name: 'Fortune', url: 'fortune.com', category: 'Finance', region: 'Global', description: 'Fortune 500 & business.' },
  { id: 'inc', name: 'Inc.', url: 'inc.com', category: 'Finance', region: 'Global', description: 'Entrepreneurship & startups.' },
  { id: 'fast-company', name: 'Fast Company', url: 'fastcompany.com', category: 'Finance', region: 'Global', description: 'Business innovation.' },
  { id: 'cnbc', name: 'CNBC', url: 'cnbc.com', category: 'Finance', region: 'Global', description: 'Business news network.' },
  { id: 'marketwatch', name: 'MarketWatch', url: 'marketwatch.com', category: 'Finance', region: 'Global', description: 'Financial market news.' },
  { id: 'barrons', name: 'Barron\'s', url: 'barrons.com', category: 'Finance', region: 'Global', description: 'Investment weekly.' },
  { id: 'seeking-alpha', name: 'Seeking Alpha', url: 'seekingalpha.com', category: 'Finance', region: 'Global', description: 'Investment research platform.' },
  { id: 'motley-fool', name: 'The Motley Fool', url: 'fool.com', category: 'Finance', region: 'Global', description: 'Investment advice & stock picks.' },
  { id: 'investopedia', name: 'Investopedia', url: 'investopedia.com', category: 'Finance', region: 'Global', description: 'Financial education.' },
  { id: 'ars-technica', name: 'Ars Technica', url: 'arstechnica.com', category: 'Tech', region: 'Global', description: 'In-depth tech journalism.' },
  { id: 'engadget', name: 'Engadget', url: 'engadget.com', category: 'Tech', region: 'Global', description: 'Consumer electronics news.' },
  { id: 'mashable', name: 'Mashable', url: 'mashable.com', category: 'Tech', region: 'Global', description: 'Digital culture & tech.' },
  { id: 'cnet', name: 'CNET', url: 'cnet.com', category: 'Tech', region: 'Global', description: 'Tech product reviews.' },
  { id: 'zdnet', name: 'ZDNet', url: 'zdnet.com', category: 'Tech', region: 'Global', description: 'Enterprise tech news.' },
  { id: 'venturebeat', name: 'VentureBeat', url: 'venturebeat.com', category: 'Tech', region: 'Global', description: 'Tech & transformation.' },
  { id: 'the-information', name: 'The Information', url: 'theinformation.com', category: 'Tech', region: 'Global', description: 'Premium tech journalism.' },
  { id: 'protocol', name: 'Protocol', url: 'protocol.com', category: 'Tech', region: 'Global', description: 'Tech industry & policy.' },
  { id: 'recode', name: 'Recode', url: 'vox.com/recode', category: 'Tech', region: 'Global', description: 'Tech business news.' },
  { id: 'anandtech', name: 'AnandTech', url: 'anandtech.com', category: 'Tech', region: 'Global', description: 'Deep hardware analysis.' },
  { id: 'toms-hardware', name: 'Tom\'s Hardware', url: 'tomshardware.com', category: 'Tech', region: 'Global', description: 'PC hardware reviews.' },
  { id: 'hackaday', name: 'Hackaday', url: 'hackaday.com', category: 'Tech', region: 'Global', description: 'Hardware hacking & making.' },
  { id: 'slashdot', name: 'Slashdot', url: 'slashdot.org', category: 'Tech', region: 'Global', description: 'News for nerds.' },
  { id: 'hacker-news', name: 'Hacker News', url: 'news.ycombinator.com', category: 'Tech', region: 'Global', description: 'Tech community news.' },
  { id: 'vanity-fair', name: 'Vanity Fair', url: 'vanityfair.com', category: 'Culture', region: 'Global', description: 'Culture, politics & style.' },
  { id: 'rolling-stone', name: 'Rolling Stone', url: 'rollingstone.com', category: 'Culture', region: 'Global', description: 'Music & popular culture.' },
  { id: 'pitchfork', name: 'Pitchfork', url: 'pitchfork.com', category: 'Culture', region: 'Global', description: 'Independent music criticism.' },
  { id: 'billboard', name: 'Billboard', url: 'billboard.com', category: 'Culture', region: 'Global', description: 'Music industry authority.' },
  { id: 'variety', name: 'Variety', url: 'variety.com', category: 'Culture', region: 'Global', description: 'Entertainment industry news.' },
  { id: 'hollywood-reporter', name: 'The Hollywood Reporter', url: 'hollywoodreporter.com', category: 'Culture', region: 'Global', description: 'Entertainment business news.' },
  { id: 'deadline', name: 'Deadline', url: 'deadline.com', category: 'Culture', region: 'Global', description: 'Hollywood & media news.' },
  { id: 'indiewire', name: 'IndieWire', url: 'indiewire.com', category: 'Culture', region: 'Global', description: 'Film industry news.' },
  { id: 'av-club', name: 'The A.V. Club', url: 'avclub.com', category: 'Culture', region: 'Global', description: 'Pop culture commentary.' },
  { id: 'vulture', name: 'Vulture', url: 'vulture.com', category: 'Culture', region: 'Global', description: 'Entertainment & culture from NY Mag.' },
  { id: 'slate', name: 'Slate', url: 'slate.com', category: 'Culture', region: 'Global', description: 'News & commentary.' },
  { id: 'salon', name: 'Salon', url: 'salon.com', category: 'Culture', region: 'Global', description: 'Progressive news & culture.' },
  { id: 'harpers', name: 'Harper\'s Magazine', url: 'harpers.org', category: 'Culture', region: 'Global', description: 'Literature & politics.' },
  { id: 'paris-review', name: 'The Paris Review', url: 'theparisreview.org', category: 'Culture', region: 'Global', description: 'Literary quarterly.' },
  { id: 'granta', name: 'Granta', url: 'granta.com', category: 'Culture', region: 'Global', description: 'New writing magazine.' },
  { id: 'gq', name: 'GQ', url: 'gq.com', category: 'Fashion', region: 'Global', description: 'Men\'s style & culture.' },
  { id: 'esquire', name: 'Esquire', url: 'esquire.com', category: 'Fashion', region: 'Global', description: 'Men\'s magazine.' },
  { id: 'harpers-bazaar', name: 'Harper\'s Bazaar', url: 'harpersbazaar.com', category: 'Fashion', region: 'Global', description: 'Women\'s fashion magazine.' },
  { id: 'elle', name: 'Elle', url: 'elle.com', category: 'Fashion', region: 'Global', description: 'Fashion & beauty.' },
  { id: 'marie-claire', name: 'Marie Claire', url: 'marieclaire.com', category: 'Fashion', region: 'Global', description: 'Women\'s lifestyle.' },
  { id: 'cosmopolitan', name: 'Cosmopolitan', url: 'cosmopolitan.com', category: 'Fashion', region: 'Global', description: 'Young women\'s magazine.' },
  { id: 'instyle', name: 'InStyle', url: 'instyle.com', category: 'Fashion', region: 'Global', description: 'Celebrity style & beauty.' },
  { id: 'refinery29', name: 'Refinery29', url: 'refinery29.com', category: 'Fashion', region: 'Global', description: 'Women\'s lifestyle & fashion.' },
  { id: 'man-repeller', name: 'Man Repeller', url: 'manrepeller.com', category: 'Fashion', region: 'Global', description: 'Style & culture blog.' },
  { id: 'coveteur', name: 'Coveteur', url: 'coveteur.com', category: 'Fashion', region: 'Global', description: 'Fashion & beauty insider.' },
  { id: 'gamespot', name: 'GameSpot', url: 'gamespot.com', category: 'Gaming', region: 'Global', description: 'Video game news & reviews.' },
  { id: 'destructoid', name: 'Destructoid', url: 'destructoid.com', category: 'Gaming', region: 'Global', description: 'Independent gaming blog.' },
  { id: 'rock-paper-shotgun', name: 'Rock Paper Shotgun', url: 'rockpapershotgun.com', category: 'Gaming', region: 'Global', description: 'PC gaming blog.' },
  { id: 'vg247', name: 'VG247', url: 'vg247.com', category: 'Gaming', region: 'Global', description: 'Video game news 24/7.' },
  { id: 'giant-bomb', name: 'Giant Bomb', url: 'giantbomb.com', category: 'Gaming', region: 'Global', description: 'Gaming community site.' },
  { id: 'game-informer', name: 'Game Informer', url: 'gameinformer.com', category: 'Gaming', region: 'Global', description: 'Gaming magazine.' },
  { id: 'nintendo-life', name: 'Nintendo Life', url: 'nintendolife.com', category: 'Gaming', region: 'Global', description: 'Nintendo news & reviews.' },
  { id: 'push-square', name: 'Push Square', url: 'pushsquare.com', category: 'Gaming', region: 'Global', description: 'PlayStation community.' },
  { id: 'pure-xbox', name: 'Pure Xbox', url: 'purexbox.com', category: 'Gaming', region: 'Global', description: 'Xbox news & reviews.' },
  { id: 'dwell', name: 'Dwell', url: 'dwell.com', category: 'Design', region: 'Global', description: 'Modern home design.' },
  { id: 'metropolis', name: 'Metropolis', url: 'metropolismag.com', category: 'Design', region: 'Global', description: 'Architecture & design magazine.' },
  { id: 'frame', name: 'Frame', url: 'frameweb.com', category: 'Design', region: 'Global', description: 'Interior design magazine.' },
  { id: 'azure', name: 'Azure Magazine', url: 'azuremagazine.com', category: 'Design', region: 'Global', description: 'Architecture & design.' },
  { id: 'surface', name: 'Surface', url: 'surfacemag.com', category: 'Design', region: 'Global', description: 'Design & architecture.' },
  { id: 'design-boom', name: 'designboom', url: 'designboom.com', category: 'Design', region: 'Global', description: 'Architecture & design magazine.' },
  { id: 'yanko-design', name: 'Yanko Design', url: 'yankodesign.com', category: 'Design', region: 'Global', description: 'Modern industrial design.' },
  { id: 'core77', name: 'Core77', url: 'core77.com', category: 'Design', region: 'Global', description: 'Industrial design resource.' },
  { id: 'smithsonian', name: 'Smithsonian Magazine', url: 'smithsonianmag.com', category: 'Science', region: 'Global', description: 'History, science & arts.' },
  { id: 'discover', name: 'Discover Magazine', url: 'discovermagazine.com', category: 'Science', region: 'Global', description: 'Science for the curious.' },
  { id: 'new-scientist', name: 'New Scientist', url: 'newscientist.com', category: 'Science', region: 'Global', description: 'Science news weekly.' },
  { id: 'live-science', name: 'Live Science', url: 'livescience.com', category: 'Science', region: 'Global', description: 'The most interesting articles.' },
  { id: 'science-daily', name: 'ScienceDaily', url: 'sciencedaily.com', category: 'Science', region: 'Global', description: 'Latest research news.' },
  { id: 'astronomy', name: 'Astronomy Magazine', url: 'astronomy.com', category: 'Science', region: 'Global', description: 'Space exploration magazine.' },
  { id: 'sky-telescope', name: 'Sky & Telescope', url: 'skyandtelescope.org', category: 'Science', region: 'Global', description: 'Essential guide to astronomy.' },
  { id: 'espn', name: 'ESPN', url: 'espn.com', category: 'Sports', region: 'Global', description: 'The worldwide leader in sports.' },
  { id: 'sports-illustrated', name: 'Sports Illustrated', url: 'si.com', category: 'Sports', region: 'Global', description: 'Sports journalism icon.' },
  { id: 'the-athletic', name: 'The Athletic', url: 'theathletic.com', category: 'Sports', region: 'Global', description: 'Premium sports news.' },
  { id: 'bleacher-report', name: 'Bleacher Report', url: 'bleacherreport.com', category: 'Sports', region: 'Global', description: 'Sports news & highlights.' },
  { id: 'cbssports', name: 'CBS Sports', url: 'cbssports.com', category: 'Sports', region: 'Global', description: 'Sports news & scores.' },
  { id: 'yahoo-sports', name: 'Yahoo Sports', url: 'sports.yahoo.com', category: 'Sports', region: 'Global', description: 'Sports news & fantasy.' },
  { id: 'sporting-news', name: 'Sporting News', url: 'sportingnews.com', category: 'Sports', region: 'Global', description: 'Sports content & analysis.' },
  { id: 'goal', name: 'Goal.com', url: 'goal.com', category: 'Sports', region: 'Global', description: 'Football news worldwide.' },
  { id: 'fourfourtwo', name: 'FourFourTwo', url: 'fourfourtwo.com', category: 'Sports', region: 'Global', description: 'Football magazine.' },
  { id: 'skysports', name: 'Sky Sports', url: 'skysports.com', category: 'Sports', region: 'Global', description: 'UK sports broadcaster.' },
  { id: 'bbc-sport', name: 'BBC Sport', url: 'bbc.com/sport', category: 'Sports', region: 'Global', description: 'British sports coverage.' },
  { id: 'nat-geo-traveler', name: 'National Geographic Traveler', url: 'nationalgeographic.com/travel', category: 'Travel', region: 'Global', description: 'Inspiring travel stories.' },
  { id: 'afar', name: 'AFAR', url: 'afar.com', category: 'Travel', region: 'Global', description: 'Experiential travel magazine.' },
  { id: 'rough-guides', name: 'Rough Guides', url: 'roughguides.com', category: 'Travel', region: 'Global', description: 'Travel guidebooks & tips.' },
  { id: 'atlas-obscura', name: 'Atlas Obscura', url: 'atlasobscura.com', category: 'Travel', region: 'Global', description: 'Unusual & curious places.' },
  { id: 'saveur', name: 'Saveur', url: 'saveur.com', category: 'Food', region: 'Global', description: 'Authentic world cuisine.' },
  { id: 'kitchn', name: 'The Kitchn', url: 'thekitchn.com', category: 'Food', region: 'Global', description: 'Food & cooking blog.' },
  { id: 'simply-recipes', name: 'Simply Recipes', url: 'simplyrecipes.com', category: 'Food', region: 'Global', description: 'Trusted recipe collection.' },
  { id: 'delish', name: 'Delish', url: 'delish.com', category: 'Food', region: 'Global', description: 'Food news & recipes.' },
  { id: 'taste', name: 'Taste', url: 'tastemade.com', category: 'Food', region: 'Global', description: 'Food & travel videos.' },
  { id: 'chowhound', name: 'Chowhound', url: 'chowhound.com', category: 'Food', region: 'Global', description: 'Food enthusiast community.' },
  { id: 'cook-illustrated', name: 'Cook\'s Illustrated', url: 'cooksillustrated.com', category: 'Food', region: 'Global', description: 'Test kitchen recipes.' },

  // --- CHINA (20 SOURCES) ---
  { id: 'thepaper', name: '澎湃新闻 (The Paper)', url: 'thepaper.cn', category: 'News', region: 'China', description: 'Shanghai investigative news.' },
  { id: 'caixin', name: '财新网 (Caixin)', url: 'caixin.com', category: 'Finance', region: 'China', description: 'Elite business news.' },
  { id: 'sixthtone', name: 'Sixth Tone', url: 'sixthtone.com', category: 'Culture', region: 'China', description: 'Deep social features.' },
  { id: 'scmp', name: 'South China Morning Post', url: 'scmp.com', category: 'News', region: 'China', description: 'Hong Kong leading voice.' },
  { id: '36kr', name: '36氪 (36Kr)', url: '36kr.com', category: 'Tech', region: 'China', description: 'Tech & startup portal.' },
  { id: 'zaobao', name: '联合早报 (Zaobao)', url: 'zaobao.com', category: 'News', region: 'Global', description: 'Singapore-based Chinese news.' },

  // --- CHINA ADDITIONAL ---
  { id: 'xinhua', name: '新华网 (Xinhua)', url: 'xinhuanet.com', category: 'News', region: 'China', description: 'State news agency.' },
  { id: 'peoples-daily', name: '人民网 (People\'s Daily)', url: 'people.com.cn', category: 'News', region: 'China', description: 'Official newspaper online.' },
  { id: 'china-daily', name: 'China Daily', url: 'chinadaily.com.cn', category: 'News', region: 'China', description: 'English-language state newspaper.' },
  { id: 'global-times', name: 'Global Times', url: 'globaltimes.cn', category: 'News', region: 'China', description: 'State-run tabloid.' },
  { id: 'ifeng', name: '凤凰网 (ifeng)', url: 'ifeng.com', category: 'News', region: 'China', description: 'Major news portal.' },
  { id: 'sina', name: '新浪网 (Sina)', url: 'sina.com.cn', category: 'News', region: 'China', description: 'Leading web portal.' },
  { id: 'sohu', name: '搜狐 (Sohu)', url: 'sohu.com', category: 'News', region: 'China', description: 'Major web portal.' },
  { id: 'tencent-news', name: '腾讯新闻 (Tencent News)', url: 'news.qq.com', category: 'News', region: 'China', description: 'Tencent news portal.' },
  { id: 'netease', name: '网易新闻 (NetEase News)', url: 'news.163.com', category: 'News', region: 'China', description: 'Major news aggregator.' },
  { id: 'yicai', name: '第一财经 (Yicai)', url: 'yicai.com', category: 'Finance', region: 'China', description: 'Shanghai-based business news.' },
  { id: 'jiemian', name: '界面新闻 (Jiemian)', url: 'jiemian.com', category: 'News', region: 'China', description: 'Modern news platform.' },
  { id: 'huxiu', name: '虎嗅网 (Huxiu)', url: 'huxiu.com', category: 'Tech', region: 'China', description: 'Tech & business insights.' },
  { id: 'tmtpost', name: '钛媒体 (TMTPost)', url: 'tmtpost.com', category: 'Tech', region: 'China', description: 'Tech media platform.' },
  { id: 'pingwest', name: 'PingWest', url: 'pingwest.com', category: 'Tech', region: 'China', description: 'Tech & innovation.' },
  { id: 'geekpark', name: '极客公园 (GeekPark)', url: 'geekpark.net', category: 'Tech', region: 'China', description: 'Geek culture & tech.' },
  { id: 'qdaily', name: '好奇心日报 (Qdaily)', url: 'qdaily.com', category: 'Culture', region: 'China', description: 'Curiosity-driven news.' },
  { id: 'douban', name: '豆瓣 (Douban)', url: 'douban.com', category: 'Culture', region: 'China', description: 'Social review platform.' },
  { id: 'bilibili', name: 'Bilibili', url: 'bilibili.com', category: 'Culture', region: 'China', description: 'Video sharing platform.' },
  { id: 'mtime', name: '时光网 (Mtime)', url: 'mtime.com', category: 'Culture', region: 'China', description: 'Movie database & news.' },
  { id: 'dianping', name: '大众点评 (Dianping)', url: 'dianping.com', category: 'Food', region: 'China', description: 'Restaurant reviews platform.' },
  { id: 'xiaohongshu', name: '小红书 (Xiaohongshu)', url: 'xiaohongshu.com', category: 'Culture', region: 'China', description: 'Lifestyle community platform.' },
  { id: 'zhihu', name: '知乎 (Zhihu)', url: 'zhihu.com', category: 'Culture', region: 'China', description: 'Q&A community platform.' },
  { id: 'mafengwo', name: '马蜂窝 (Mafengwo)', url: 'mafengwo.cn', category: 'Travel', region: 'China', description: 'Travel community & guide.' },
  { id: 'ctrip', name: '携程 (Ctrip)', url: 'ctrip.com', category: 'Travel', region: 'China', description: 'Leading travel platform.' },

  // --- SCIENCE (EXPANDED) ---
  { id: 'nature', name: 'Nature', url: 'nature.com', category: 'Science', region: 'Global', description: 'World\'s leading multidisciplinary science journal.' },
  { id: 'sci-mag', name: 'Science Magazine', url: 'science.org', category: 'Science', region: 'Global', description: 'AAAS flagship publication.' },
  { id: 'newton-jp', name: 'Newton (ニュートン)', url: 'newtonpress.co.jp', category: 'Science', region: 'Japan', description: 'Most popular science magazine in Japan.' },
  { id: 'phys-org', name: 'Phys.org', url: 'phys.org', category: 'Science', region: 'Global', description: 'Latest physics and tech research news.' },
  { id: 'sciam', name: 'Scientific American', url: 'scientificamerican.com', category: 'Science', region: 'Global', description: 'Longest running magazine in the US.' },
  { id: 'pop-sci', name: 'Popular Science', url: 'popsci.com', category: 'Science', region: 'Global', description: 'The what\'s new magazine.' },
  { id: 'space-com', name: 'Space.com', url: 'space.com', category: 'Science', region: 'Global', description: 'The premier source of space exploration news.' },
  { id: 'sci-news', name: 'Science News', url: 'sciencenews.org', category: 'Science', region: 'Global', description: 'Award-winning news from the world of science.' },
  { id: 'quanta', name: 'Quanta Magazine', url: 'quantamagazine.org', category: 'Science', region: 'Global', description: 'Illuminating basic science and math research.' },
  { id: 'natgeo-jp', name: 'National Geographic JP', url: 'natgeo.nikkeibp.co.jp', category: 'Science', region: 'Japan', description: 'Japanese edition of the world-famous exploration magazine.' },
  { id: 'mit-tech', name: 'MIT Technology Review', url: 'technologyreview.com', category: 'Science', region: 'Global', description: 'Insights into the tech world from MIT experts.' },

  // --- TRAVEL (EXPANDED) ---
  { id: 'lonelyplanet', name: 'Lonely Planet', url: 'lonelyplanet.com', category: 'Travel', region: 'Global', description: 'World leader in travel guidebooks.' },
  { id: 'travelleisure', name: 'Travel + Leisure', url: 'travelandleisure.com', category: 'Travel', region: 'Global', description: 'Luxe travel and inspiration.' },
  { id: 'jalan-jp', name: 'Jalan News (じゃらんニュース)', url: 'jalan.net/news/', category: 'Travel', region: 'Japan', description: 'Largest travel and hotel portal in Japan.' },
  { id: 'timeout-tokyo', name: 'Time Out Tokyo', url: 'timeout.com/tokyo', category: 'Travel', region: 'Japan', description: 'Best city guide for Tokyo.' },
  { id: 'cntraveller', name: 'Condé Nast Traveler', url: 'cntraveler.com', category: 'Travel', region: 'Global', description: 'Premium travel news and advice.' },
  { id: 'japan-travel', name: 'Japan Travel (Official)', url: 'japan.travel/en/', category: 'Travel', region: 'Japan', description: 'Official tourism board insights.' },
  { id: 'japan-guide', name: 'Japan-Guide', url: 'japan-guide.com', category: 'Travel', region: 'Japan', description: 'Most comprehensive resource for Japanese travel.' },
  { id: 'matcha', name: 'MATCHA', url: 'matcha-jp.com', category: 'Travel', region: 'Japan', description: 'Web magazine for Japan travel and culture.' },
  { id: 'tripadvisor-jp', name: 'TripAdvisor JP', url: 'tripadvisor.jp', category: 'Travel', region: 'Japan', description: 'World largest travel platform in Japanese.' },
  { id: 'fodors', name: 'Fodor\'s Travel', url: 'fodors.com', category: 'Travel', region: 'Global', description: 'Expert travel advice and reviews.' },
  { id: 'cnt-jp', name: 'Condé Nast Traveler JP', url: 'vogue.co.jp/travel', category: 'Travel', region: 'Japan', description: 'High-end travel and lifestyle for Japan.' },

  // --- FOOD (EXPANDED) ---
  { id: 'eater', name: 'Eater', url: 'eater.com', category: 'Food', region: 'Global', description: 'The essential guide to food and dining.' },
  { id: 'foodandwine', name: 'Food & Wine', url: 'foodandwine.com', category: 'Food', region: 'Global', description: 'Recipes, travel and lifestyle.' },
  { id: 'dancyu-jp', name: 'dancyu', url: 'dancyu.jp', category: 'Food', region: 'Japan', description: 'Japan\'s top food enthusiast magazine.' },
  { id: 'tabelog-mag', name: 'Tabelog Magazine', url: 'magazine.tabelog.com', category: 'Food', region: 'Japan', description: 'Deep dives into Japanese gourmet culture.' },
  { id: 'seriouseats', name: 'Serious Eats', url: 'seriouseats.com', category: 'Food', region: 'Global', description: 'The destination for delicious food.' },
  { id: 'bon-appetit', name: 'Bon Appétit', url: 'bonappetit.com', category: 'Food', region: 'Global', description: 'Where food and culture meet.' },
  { id: 'cookpad', name: 'Cookpad (クックパッド)', url: 'cookpad.com', category: 'Food', region: 'Japan', description: 'Japan\'s largest recipe sharing service.' },
  { id: 'kurashiru', name: 'Kurashiru (クラシル)', url: 'kurashiru.com', category: 'Food', region: 'Japan', description: 'World\'s #1 recipe video app.' },
  { id: 'epicurious', name: 'Epicurious', url: 'epicurious.com', category: 'Food', region: 'Global', description: 'Trusted recipes and culinary inspiration.' },
  { id: 'food52', name: 'Food52', url: 'food52.com', category: 'Food', region: 'Global', description: 'A community for home cooks.' },
  { id: 'soranews-food', name: 'SoraNews24 Food', url: 'soranews24.com/category/food/', category: 'Food', region: 'Japan', description: 'Quirky and trending Japanese food news.' },
];

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
      // Removed duplicate genre and difficulty as they are already in content returned by processNewsArticle
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
