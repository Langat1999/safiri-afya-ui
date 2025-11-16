# Health & Wellness News Feature Setup Guide

## What Was Implemented

A complete health news section has been added to your Safiri Afya app to educate users on healthy living.

### Features:
- **Real-time health news** from multiple trusted sources
- **Hybrid approach**: Guardian API + RSS feeds (WHO, Medical News Today, Healthline)
- **Smart caching**: 30-minute cache to reduce API calls
- **Bilingual support**: English and Swahili
- **Responsive design**: Works on all devices
- **Auto-refresh**: Button to manually refresh news
- **Beautiful cards**: With images, sources, and publication dates

## Components Created

### Backend (`backend/src/server.js`)
- `/api/news/health` endpoint (lines 1131-1256)
- Fetches from Guardian API (if configured)
- Fetches from RSS feeds (WHO, Medical News Today, Healthline)
- 30-minute cache to reduce API calls
- Error handling with fallback to cached data

### Frontend
1. **HealthNews Component** (`src/components/HealthNews.tsx`)
   - Displays news articles in a responsive grid
   - Shows article images, titles, descriptions, sources
   - "Read Article" buttons that open in new tabs
   - Refresh button for manual updates

2. **Navigation Link** (in `src/components/Navbar.tsx`)
   - "Health News" button in navbar
   - Smooth scroll to news section
   - Hidden on small screens to save space

3. **Main Page Integration** (`src/pages/Index.tsx`)
   - Added as the last section before footer
   - Perfect for educating users on healthy living

## Getting Better News Sources

### Option 1: Free Guardian API (Recommended)

The Guardian offers **5,000 free requests per day** with high-quality health journalism.

**Setup:**
1. Visit https://open-platform.theguardian.com/access/
2. Register for a free API key (no credit card required)
3. Add to your `.env` file:
   ```
   GUARDIAN_API_KEY=your-api-key-here
   ```
4. Restart backend: The news will automatically include Guardian articles

### Option 2: Use RSS Feeds Only (Current Setup)

Currently working with:
- ✅ WHO (World Health Organization) - Authoritative health news
- ❌ Medical News Today - URL changed (404 error)
- ❌ Healthline - URL changed (404 error)

### Option 3: Update RSS Feed URLs

Some RSS feeds may have changed URLs. Here are updated alternatives:

**Edit `backend/src/server.js` around line 1177:**

```javascript
const feeds = [
  { url: 'https://www.who.int/rss-feeds/news-english.xml', name: 'WHO' },
  { url: 'https://www.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC', name: 'WebMD' },
  { url: 'https://feeds.feedburner.com/HealthDay', name: 'HealthDay' },
  // Add Kenya-specific sources if available
];
```

### Option 4: Add More Free APIs

**NewsAPI** (100 requests/day):
1. Get free key at https://newsapi.org
2. Add endpoint in backend (example in documentation)

**GNews API** (100 requests/day):
1. Get free key at https://gnews.io
2. Add endpoint for Kenya-specific health news

## Current Status

### What's Working ✅
- Backend endpoint running at `http://localhost:3001/api/news/health`
- Frontend component displaying news
- Smart caching (30 minutes)
- Navigation link in navbar
- Bilingual support (English/Swahili)
- WHO RSS feed working
- Error handling and graceful degradation

### What Needs Attention ⚠️
- Some RSS feeds return 404 (URLs may have changed)
- Guardian API key not configured (optional but recommended)
- Consider adding Kenya-specific health news sources

## Testing the Feature

1. **View the News Section:**
   - Visit http://localhost:8080
   - Scroll down to "Health & Wellness News" section
   - Or click "Health News" in the navbar

2. **Test API Endpoint:**
   ```bash
   curl http://localhost:3001/api/news/health
   ```

3. **Check Cache:**
   - First request: Fetches fresh data
   - Next requests (within 30 min): Serves from cache
   - After 30 min: Fetches fresh data again

## Customization

### Change Cache Duration
Edit `backend/src/server.js` line 1140:
```javascript
cacheDuration: 60 * 60 * 1000, // 1 hour instead of 30 minutes
```

### Add More RSS Feeds
Edit `backend/src/server.js` lines 1177-1181:
```javascript
const feeds = [
  { url: 'https://www.who.int/rss-feeds/news-english.xml', name: 'WHO' },
  { url: 'YOUR_FEED_URL', name: 'YOUR_SOURCE_NAME' },
];
```

### Change Number of Articles
Edit `backend/src/server.js` line 1230:
```javascript
newsCache.articles = allArticles.slice(0, 30); // Show 30 instead of 20
```

### Customize Component Title
Edit `src/components/HealthNews.tsx` lines 27-28:
```javascript
title: "Your Custom Title Here",
subtitle: "Your custom subtitle",
```

## Troubleshooting

### Issue: No articles showing
**Solution:** Check backend logs for errors. Some RSS feeds might be down temporarily.

### Issue: 404 errors for RSS feeds
**Solution:** Update RSS feed URLs in `backend/src/server.js`

### Issue: Slow loading
**Solution:** This is normal on first load. Cache will make subsequent loads instant.

### Issue: Want Kenya-specific news
**Solution:** Use GNews API with `country=ke` parameter (100 free requests/day)

## Next Steps

1. **Get Guardian API key** (recommended for quality content)
2. **Update RSS feed URLs** that are returning 404
3. **Add Kenya-specific sources** for local health news
4. **Monitor cache performance** and adjust duration if needed

## Support

- Guardian API: https://open-platform.theguardian.com/documentation/
- WHO RSS: https://www.who.int/about/policies/publishing/rss
- NewsAPI: https://newsapi.org/docs
- GNews: https://gnews.io/docs

Your health news feature is now live and educating users on healthy living!
