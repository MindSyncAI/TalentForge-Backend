import { useState, useEffect } from "react";
import { Newspaper } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  image: string;
  link: string;
  description: string;
}

export function NewsWidget() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://newsdata.io/api/1/news?apikey=${import.meta.env.VITE_NEWS_API_KEY}&country=in,us&language=en&category=technology`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }

        const data = await response.json();
        
        if (data.status === "success" && data.results) {
          const formattedNews = data.results
            .filter((item: any) => item.image_url) // Only include items with images
            .slice(0, 5)
            .map((item: any, index: number) => {
            // Get relative time
            const publishedDate = new Date(item.pubDate || Date.now());
            const now = new Date();
            const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
            
            const timeString = diffInHours < 24 
              ? `${diffInHours} hours ago` 
              : `${Math.floor(diffInHours / 24)} days ago`;
            
            return {
              id: item.article_id || index.toString(),
              title: item.title,
              source: item.source_id || "News Source",
              time: timeString,
              image: item.image_url,
              link: item.link,
              description: item.summary
            };
          });
          
          setNewsItems(formattedNews);
        } else {
          throw new Error("Invalid news data format");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        setError("Failed to fetch news data");
        
        // Fallback to static data
        const fallbackNews = [
          {
            id: "1",
            title: "Apple plans to add 'AI doctor' to iPhone's Health app: Here's what it could do",
            source: "Mint",
            time: "2 hours ago",
            image: "/lovable-uploads/a1a9cfdc-886e-43aa-8ee1-76a0fd56a144.png",
            link: "#",
            description: "Apple is reportedly planning to add an 'AI doctor' to the Health app on iPhones. Here's what it could do."
          },
          {
            id: "2",
            title: "5 Top Smartphones That Have Better Cameras Than iPhone 16e",
            source: "News 18",
            time: "4 hours ago",
            image: "/lovable-uploads/97773941-004e-4aa7-b3ce-3ddf0c53fa09.png",
            link: "#",
            description: "Here are five smartphones that have better cameras than the iPhone 16e."
          },
          {
            id: "3",
            title: "Amazon bumper offers on TVs: Get up to 60% discount, no cost EMIs and exchange offers on Samsung, LG and more",
            source: "Hindustan Times",
            time: "6 hours ago",
            image: "/lovable-uploads/efdadaaf-bdbb-4c2b-a465-5a5df79d378b.png",
            link: "#",
            description: "Amazon is offering bumper discounts on TVs. Get up to 60% discount, no cost EMIs, and exchange offers on Samsung, LG, and more."
          },
          {
            id: "4",
            title: "Five memorable Microsoft legacies in computer culture",
            source: "The Economic Times",
            time: "8 hours ago",
            image: "/lovable-uploads/a1a9cfdc-886e-43aa-8ee1-76a0fd56a144.png",
            link: "#",
            description: "Here are five memorable Microsoft legacies in computer culture."
          }
        ];
        
        setNewsItems(fallbackNews);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="h-full overflow-hidden">
        <h2 className="text-lg font-bold mb-4 text-white dark:text-white light:text-gray-800">Latest News</h2>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-20 h-16 bg-gray-700 dark:bg-gray-700 light:bg-gray-300 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 dark:bg-gray-700 light:bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 dark:bg-gray-700 light:bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              {i < 3 && <Separator className="my-4 bg-[#2D2D2F] dark:bg-[#2D2D2F] light:bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && newsItems.length === 0) {
    return (
      <div className="h-full overflow-hidden">
        <h2 className="text-lg font-bold mb-4 text-white dark:text-white light:text-gray-800">Latest News</h2>
        <p className="text-red-400 dark:text-red-400 light:text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 mt-[5px] text-white dark:text-white light:text-gray-800 text-center">Latest News</h2>
      
      <div className="h-full overflow-y-auto scrollbar-none">
        {newsItems.map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-800 dark:text-white hover:text-talentforge-400 dark:hover:text-talentforge-400 transition-colors duration-200 bg-transparent hover:bg-transparent"
          >
            <div className="flex gap-4 p-4 hover:bg-white/5 transition-colors">
              <img
                src={item.image}
                alt=""
                className="w-16 h-16 object-cover rounded-lg"
                onError={(e) => {
                  // Remove the news item if image fails to load
                  setNewsItems(prev => prev.filter(news => news.id !== item.id));
                }}
              />
              <div className="flex-1 p-3 rounded-lg bg-[#ccdcec]/60 dark:bg-[#111112]/40 backdrop-blur-xl border border-[#ccdcec] dark:border-[#1D1D1F]">
                <h3 className="text-sm font-medium text-black dark:text-white mb-1">{item.title}</h3>
                <p className="text-xs text-black/60 dark:text-gray-400">{item.description}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
