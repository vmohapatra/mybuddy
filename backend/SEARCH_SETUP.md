# Search API Setup Guide

This guide explains how to set up real search functionality using various search APIs instead of mock data.

## Overview

The system now supports three search engines:
1. **Google Custom Search** (recommended, most comprehensive)
2. **Bing Search** (good alternative)
3. **DuckDuckGo** (free fallback, no API key required)

## 1. Google Custom Search API (Recommended)

### Setup Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Custom Search API"
4. Create credentials (API Key)
5. Go to [Google Custom Search Engine](https://cse.google.com/cse/)
6. Create a new search engine
7. Get your Search Engine ID (cx)

### Environment Variables:
```bash
GOOGLE_SEARCH_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### Benefits:
- Most comprehensive results
- High-quality source categorization
- Rich metadata (publication dates, authors)
- Excellent relevance scoring

## 2. Bing Search API

### Setup Steps:
1. Go to [Microsoft Azure Portal](https://portal.azure.com/)
2. Create a new resource
3. Search for "Bing Search v7"
4. Create the resource
5. Get your subscription key

### Environment Variables:
```bash
BING_SEARCH_API_KEY=your_bing_api_key_here
```

### Benefits:
- Good alternative to Google
- Microsoft's search technology
- Reliable and fast

## 3. DuckDuckGo (Free Fallback)

### Setup:
- No setup required
- Automatically enabled as fallback
- No API key needed

### Environment Variables:
```bash
DUCKDUCKGO_ENABLED=true  # Default: true
```

### Benefits:
- Completely free
- No API key required
- Privacy-focused
- Good fallback option

## Configuration Priority

The system tries search engines in this order:
1. **Google Custom Search** (if configured)
2. **Bing Search** (if configured)
3. **DuckDuckGo** (always available as fallback)

## Environment Variables Summary

```bash
# Google Custom Search (recommended)
GOOGLE_SEARCH_API_KEY=your_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id

# Bing Search (optional)
BING_SEARCH_API_KEY=your_bing_api_key

# DuckDuckGo (fallback)
DUCKDUCKGO_ENABLED=true
```

## Testing the Setup

1. Start the application
2. Perform a search
3. Check the logs for search results:
   ```
   Google search returned X results
   Bing search returned X results
   DuckDuckGo search returned X results
   ```

## Troubleshooting

### No Search Results:
- Check API keys are correct
- Verify search engines are enabled
- Check network connectivity
- Review application logs

### Rate Limiting:
- Google: 100 queries/day (free tier)
- Bing: 1000 queries/month (free tier)
- DuckDuckGo: No rate limits

### Fallback Behavior:
- If primary search engines fail, DuckDuckGo automatically activates
- System logs all failures for debugging
- Graceful degradation ensures search always works

## Cost Considerations

- **Google Custom Search**: Free tier (100 queries/day), then $5 per 1000 queries
- **Bing Search**: Free tier (1000 queries/month), then $3 per 1000 queries
- **DuckDuckGo**: Completely free, unlimited

## Security Notes

- Never commit API keys to version control
- Use environment variables or secure configuration management
- Rotate API keys regularly
- Monitor API usage for unexpected charges
