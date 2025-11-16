import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Newspaper, Calendar, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdSlot } from "@/components/AdSlot";

interface HealthNewsProps {
  language: 'en' | 'sw';
}

interface Article {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: string;
  category?: string;
}

export const HealthNews = ({ language }: HealthNewsProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const content = {
    en: {
      title: "Health & Wellness News",
      subtitle: "Stay informed with the latest health articles from trusted sources",
      readMore: "Read Article",
      refresh: "Refresh News",
      refreshing: "Refreshing...",
      loading: "Loading latest health news...",
      noArticles: "No articles available at the moment",
      error: "Failed to load health news",
      sources: "Sources: WHO, The Guardian, Medical News Today, Healthline",
      publishedOn: "Published",
    },
    sw: {
      title: "Habari za Afya na Ustawi",
      subtitle: "Baki umejulikana na makala za hivi karibuni za afya kutoka vyanzo vinavyoaminika",
      readMore: "Soma Makala",
      refresh: "Onyesha Upya Habari",
      refreshing: "Inaonyesha upya...",
      loading: "Inapakia habari za hivi karibuni za afya...",
      noArticles: "Hakuna makala zinazopatikana kwa sasa",
      error: "Imeshindwa kupakia habari za afya",
      sources: "Vyanzo: WHO, The Guardian, Medical News Today, Healthline",
      publishedOn: "Ilichapishwa",
    },
  };

  const t = content[language];

  const fetchNews = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/news/health`);

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      setArticles(data.articles || []);

      if (isRefresh) {
        toast.success(
          language === 'en' ? 'News refreshed successfully!' : 'Habari zimeonyeshwa upya!'
        );
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error(t.error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return language === 'en' ? 'Just now' : 'Sasa hivi';
    } else if (diffHours < 24) {
      return language === 'en'
        ? `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        : `Masaa ${diffHours} iliyopita`;
    } else if (diffDays < 7) {
      return language === 'en'
        ? `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
        : `Siku ${diffDays} zilizopita`;
    } else {
      return date.toLocaleDateString(language === 'en' ? 'en-US' : 'sw-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <section id="health-news" className="py-20 bg-muted/30">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Newspaper className="w-8 h-8 text-primary" />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                {t.title}
              </h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
            <div className="flex items-center justify-center gap-4">
              <p className="text-xs text-muted-foreground">
                {t.sources}
              </p>
              <Button
                onClick={() => fetchNews(true)}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.refreshing}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t.refresh}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Articles Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">{t.loading}</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noArticles}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <>
                  {/* Regular Article Card */}
                  <Card key={index} className="hover:shadow-lg transition-shadow flex flex-col">
                    {article.imageUrl && (
                      <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <CardHeader className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {article.source}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {article.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => window.open(article.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t.readMore}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Inject Ad every 6 articles */}
                  {(index + 1) % 6 === 0 && index < articles.length - 1 && (
                    <div key={`ad-${index}`} className="flex items-center">
                      <AdSlot type="native" />
                    </div>
                  )}
                </>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
