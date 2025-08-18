# Search Preferences & Filters Guide

## 🎯 Overview

The search system now supports comprehensive preferences and filters that allow users to customize their search experience. You can control what sources are included, how results are filtered, and how they're sorted.

## 🔧 How to Set Search Preferences

### **1. Basic Search with Default Preferences**

```typescript
// Simple search with default preferences
const searchRequest = {
  query: "artificial intelligence trends 2024",
  profileId: 1
};

const results = await searchService.performSearch(searchRequest);
```

### **2. Search with Custom Preferences**

```typescript
// Custom search with specific preferences
const searchRequest = {
  query: "machine learning algorithms",
  profileId: 1,
  preferences: {
    contentTypes: ["research_paper", "academic"],
    academicOnly: true,
    minRelevanceScore: 0.7,
    maxResults: 15,
    sortOrder: "date"
  }
};

const results = await searchService.performSearch(searchRequest);
```

### **3. Using Predefined Preference Sets**

```typescript
// Get academic preferences
const academicPrefs = await searchService.getAcademicPreferences();

// Use them in search
const searchRequest = {
  query: "climate change research",
  profileId: 1,
  preferences: academicPrefs
};

const results = await searchService.performSearch(searchRequest);
```

## 📋 Available Preference Options

### **Content Filtering**
- **`contentTypes`**: Filter by content type (e.g., "research_paper", "news", "blog")
- **`academicOnly`**: Include only academic/research sources
- **`preferredSources`**: Prioritize specific domains (e.g., "wikipedia.org", "arxiv.org")
- **`excludedDomains`**: Exclude specific domains from results

### **Quality Control**
- **`minRelevanceScore`**: Minimum relevance score (0.0-1.0)
- **`maxResults`**: Maximum number of results to return (1-100)

### **Time Filtering**
- **`dateFrom`**: Start date for content (ISO format: "2024-01-01")
- **`dateTo`**: End date for content (ISO format: "2024-12-31")
- **`recentContentDays`**: Include only content from last N days

### **Search Engine Control**
- **`preferredSearchEngines`**: Preferred search engines ("google", "bing", "duckduckgo")
- **`language`**: Language preference (default: "en")

### **Result Sorting**
- **`sortOrder`**: How to sort results
  - `"relevance"`: By relevance score (default)
  - `"date"`: By publication date
  - `"title"`: Alphabetically by title

## 🎓 Predefined Preference Sets

### **Academic Preferences**
```typescript
const academicPrefs = {
  preferredSources: ["arxiv.org", "researchgate.net", ".edu", "scholar.google.com"],
  contentTypes: ["research_paper", "academic", "encyclopedia"],
  minRelevanceScore: 0.6,
  maxResults: 25,
  academicOnly: true,
  recentContentDays: 365,
  sortOrder: "relevance"
};
```

### **News Preferences**
```typescript
const newsPrefs = {
  preferredSources: ["bbc.com", "cnn.com", "reuters.com", "techcrunch.com"],
  contentTypes: ["news", "article", "blog"],
  minRelevanceScore: 0.4,
  maxResults: 15,
  recentContentDays: 30,
  sortOrder: "date"
};
```

### **Technical Preferences**
```typescript
const technicalPrefs = {
  preferredSources: ["github.com", "stackoverflow.com", "docs.microsoft.com"],
  contentTypes: ["documentation", "code_repository", "qa_forum", "tutorial"],
  minRelevanceScore: 0.5,
  maxResults: 20,
  recentContentDays: 180,
  sortOrder: "relevance"
};
```

## 🔍 Practical Examples

### **Example 1: Research Paper Search**
```typescript
const researchSearch = {
  query: "deep learning neural networks",
  profileId: 1,
  preferences: {
    contentTypes: ["research_paper", "academic"],
    academicOnly: true,
    minRelevanceScore: 0.7,
    maxResults: 20,
    preferredSources: ["arxiv.org", "ieee.org", "acm.org"],
    sortOrder: "date"
  }
};
```

### **Example 2: Current News Search**
```typescript
const newsSearch = {
  query: "latest technology developments",
  profileId: 1,
  preferences: {
    contentTypes: ["news", "article"],
    recentContentDays: 7,
    minRelevanceScore: 0.5,
    maxResults: 10,
    sortOrder: "date"
  }
};
```

### **Example 3: Technical Documentation Search**
```typescript
const techSearch = {
  query: "React hooks tutorial",
  profileId: 1,
  preferences: {
    contentTypes: ["documentation", "tutorial", "blog"],
    preferredSources: ["reactjs.org", "developer.mozilla.org", "medium.com"],
    minRelevanceScore: 0.6,
    maxResults: 15,
    recentContentDays: 365
  }
};
```

## 🚀 API Endpoints

### **Search Preferences Management**
- `GET /api/v1/search/preferences/default` - Get default preferences
- `GET /api/v1/search/preferences/academic` - Get academic preferences
- `GET /api/v1/search/preferences/news` - Get news preferences
- `GET /api/v1/search/preferences/technical` - Get technical preferences
- `POST /api/v1/search/preferences/custom` - Create custom preferences
- `GET /api/v1/search/preferences/content-types` - Get available content types
- `GET /api/v1/search/preferences/sort-options` - Get available sort options

### **Search with Preferences**
- `POST /api/v1/search` - Perform search with preferences

## 💡 Best Practices

### **1. Start Simple**
Begin with default preferences and gradually customize based on your needs.

### **2. Use Predefined Sets**
Leverage the built-in preference sets (academic, news, technical) for common use cases.

### **3. Balance Quality vs Quantity**
- Higher `minRelevanceScore` = fewer, higher-quality results
- Lower `minRelevanceScore` = more results, potentially lower quality

### **4. Consider Time Constraints**
- Use `recentContentDays` for current information
- Use `dateFrom`/`dateTo` for specific time periods

### **5. Domain-Specific Filtering**
- Use `preferredSources` to focus on trusted domains
- Use `excludedDomains` to avoid unreliable sources

## 🔧 Advanced Usage

### **Dynamic Preference Building**
```typescript
// Build preferences based on user input
function buildSearchPreferences(userInput: any) {
  const basePrefs = await searchService.getDefaultPreferences();
  
  if (userInput.academic) {
    return { ...basePrefs, ...await searchService.getAcademicPreferences() };
  }
  
  if (userInput.news) {
    return { ...basePrefs, ...await searchService.getNewsPreferences() };
  }
  
  // Custom preferences
  return {
    ...basePrefs,
    contentTypes: userInput.contentTypes || [],
    minRelevanceScore: userInput.quality || 0.5,
    maxResults: userInput.limit || 20
  };
}
```

### **Preference Persistence**
```typescript
// Save user preferences
const userPreferences = await searchService.createCustomPreferences({
  contentTypes: ["research_paper", "academic"],
  academicOnly: true,
  minRelevanceScore: 0.7
});

// Store in user profile or local storage
localStorage.setItem('searchPreferences', JSON.stringify(userPreferences));
```

## 🎯 Use Cases

### **Students & Researchers**
- Use academic preferences
- Focus on research papers and academic sources
- Set high relevance thresholds

### **News & Current Events**
- Use news preferences
- Set short time windows (7-30 days)
- Sort by date

### **Developers & Engineers**
- Use technical preferences
- Focus on documentation and code repositories
- Include recent but not necessarily current content

### **General Users**
- Use default preferences
- Moderate relevance thresholds
- Balanced result counts

## 🚨 Troubleshooting

### **No Results Returned**
1. Check if preferences are too restrictive
2. Lower `minRelevanceScore`
3. Remove content type filters
4. Check date range settings

### **Too Many Results**
1. Increase `minRelevanceScore`
2. Add content type filters
3. Set shorter time windows
4. Reduce `maxResults`

### **Results Not Relevant**
1. Adjust `preferredSources`
2. Add `excludedDomains`
3. Use `academicOnly` for research
4. Check content type filters

## 📚 Next Steps

1. **Test with different preference combinations**
2. **Create user-specific preference profiles**
3. **Implement preference learning based on user behavior**
4. **Add preference templates for common search scenarios**
5. **Integrate with user profile management**

This comprehensive preference system gives you full control over your search experience, allowing you to find exactly what you need, when you need it, from the sources you trust most.
