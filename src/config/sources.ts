export const RSS_SOURCES = [
  // Global News
  "https://feeds.reuters.com/reuters/worldNews",
  "https://www.cnbc.com/id/100727362/device/rss/rss.html",
  "https://apnews.com/rss",
  "https://www.aljazeera.com/xml/rss/all.xml",
  "https://www.bbc.co.uk/news/world/rss.xml",

  // US Government / Defense
  "https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=945&Category=0",
  "https://www.whitehouse.gov/briefing-room/feed/",
  "https://www.state.gov/rss-feed/press-releases/",

  // Indian National News
  "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms",     // TOI World
  "https://www.thehindu.com/news/international/feeder/default.rss",
  "https://indianexpress.com/section/world/feed/",
  "https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml",

  // Indian Defense & Strategic
  "https://www.thehindu.com/news/national/feeder/default.rss",
  "https://www.business-standard.com/rss/international-107.rss",

  //  Reddit - Global
  "https://www.reddit.com/r/worldnews/.rss",
  "https://www.reddit.com/r/geopolitics/.rss",
  "https://www.reddit.com/r/InternationalNews/.rss",

  // Reddit - India
  "https://www.reddit.com/r/india/.rss",
  "https://www.reddit.com/r/IndiaSpeaks/.rss",
  "https://www.reddit.com/r/IndianDefense/.rss",

  //  Conflict Monitoring
  "https://www.reddit.com/r/UkraineWarVideoReport/.rss",
  "https://www.reddit.com/r/MiddleEastNews/.rss",

  // Markets & Finance
  "https://feeds.reuters.com/reuters/businessNews",
  "https://www.cnbc.com/id/20910258/device/rss/rss.html",  // CNBC Top News
  "https://www.moneycontrol.com/rss/latestnews.xml",
  "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",  // ET Markets
  "https://www.business-standard.com/rss/markets-106.rss",

  // Tech & AI
  "https://techcrunch.com/feed/",
  "https://www.wired.com/feed/rss",
  "https://feeds.arstechnica.com/arstechnica/index",
  "https://www.theverge.com/rss/index.xml",
  "https://feeds.reuters.com/reuters/technologyNews",
  "https://www.cnbc.com/id/19854910/device/rss/rss.html",  // CNBC Tech
  "https://www.reddit.com/r/technology/.rss",
  "https://www.reddit.com/r/artificial/.rss",
  "https://www.reddit.com/r/MachineLearning/.rss",
  "https://www.reddit.com/r/programming/.rss",
];

export const REUTERS_WORLD = "https://www.reuters.com/world/";

export const MARKET_INDICES = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^IXIC", name: "NASDAQ" },
  { symbol: "^NSEI", name: "Nifty 50" },
  { symbol: "^BSESN", name: "BSE Sensex" },
];

export const TECH_STOCKS = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "GOOGL", name: "Google" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "META", name: "Meta" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "TSLA", name: "Tesla" },
];