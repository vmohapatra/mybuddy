# Testing Guide for Real Search Implementation

## 🧪 Quick Test Options

### Option 1: Test with DuckDuckGo (Recommended for Quick Testing)
DuckDuckGo doesn't require any API keys and will work immediately:

1. **Start the application:**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Test search endpoint:**
   ```bash
   curl -X POST http://localhost:8080/api/v1/search \
     -H "Content-Type: application/json" \
     -d '{
       "query": "artificial intelligence trends 2024",
       "profileId": 1
     }'
   ```

3. **Check the logs** for search results:
   ```
   DuckDuckGo search returned X results
   ```

### Option 2: Test with Google Custom Search (Best Results)
Requires API key setup but provides the best search results:

1. **Set up Google Custom Search:**
   - Follow `SEARCH_SETUP.md` guide
   - Set environment variables:
     ```bash
     export GOOGLE_SEARCH_API_KEY=your_api_key
     export GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
     ```

2. **Start the application:**
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Test search endpoint** (same as above)

### Option 3: Test with Bing Search
Good alternative to Google:

1. **Set up Bing Search:**
   - Follow `SEARCH_SETUP.md` guide
   - Set environment variable:
     ```bash
     export BING_SEARCH_API_KEY=your_bing_api_key
     ```

2. **Start the application:**
   ```bash
   ./mvnw spring-boot:run
   ```

## 🔍 What to Look For

### **Successful Search Results:**
- ✅ Real URLs (not example.com)
- ✅ Actual content descriptions
- ✅ Different source types (encyclopedia, research_paper, news, etc.)
- ✅ Relevance scores based on content quality
- ✅ AI-generated overview based on real sources

### **Log Messages:**
```
Google search returned X results
Bing search returned X results
DuckDuckGo search returned X results
```

### **API Response Structure:**
```json
{
  "query": "artificial intelligence trends 2024",
  "aiOverview": "AI-generated summary based on real sources...",
  "primarySources": [
    {
      "title": "Real article title",
      "url": "https://real-website.com/article",
      "description": "Actual content description...",
      "type": "research_paper",
      "relevanceScore": 0.95
    }
  ],
  "confidenceScore": 0.87,
  "keyPoints": ["Real insights from sources"],
  "totalSources": 15
}
```

## 🚨 Troubleshooting

### **No Search Results:**
1. Check if DuckDuckGo is enabled (default: true)
2. Verify network connectivity
3. Check application logs for errors
4. Ensure no firewall blocking outbound requests

### **Compilation Errors:**
1. Run `./mvnw clean compile` to see detailed errors
2. Check that all imports are correct
3. Verify DTO classes exist
4. Ensure Spring Boot version compatibility

### **Runtime Errors:**
1. Check application logs for stack traces
2. Verify environment variables are set correctly
3. Test individual search engines separately
4. Check API rate limits

## 📱 Frontend Testing

### **Test Search Flow:**
1. Navigate to search screen
2. Enter a search query
3. Click search button
4. Verify results show real URLs
5. Test clicking on source links
6. Check feedback functionality

### **Expected Behavior:**
- Search results load with real content
- Source URLs are clickable and open in new tabs
- AI overview is generated based on actual sources
- Confidence scores reflect real source quality
- Search history is saved with real data

## 🎯 Test Scenarios

### **Basic Search:**
- Query: "machine learning basics"
- Expected: Wikipedia, educational sites, research papers

### **Current Events:**
- Query: "latest technology news 2024"
- Expected: Recent news articles, tech blogs

### **Technical Topics:**
- Query: "React vs Angular comparison"
- Expected: Developer blogs, documentation, Stack Overflow

### **Academic Research:**
- Query: "climate change research papers"
- Expected: Academic journals, research repositories

## 🔧 Debug Mode

Enable debug logging to see detailed search operations:

```yaml
logging:
  level:
    com.buddyapp.services: DEBUG
    com.buddyapp.services.RealSearchService: DEBUG
```

## ✅ Success Criteria

The implementation is working correctly when:

1. **Real URLs are returned** (not mock/example URLs)
2. **Content descriptions are actual** (not generic text)
3. **Source types are diverse** (encyclopedia, research, news, etc.)
4. **Relevance scores vary** (not all the same)
5. **AI overview is contextual** (based on actual search results)
6. **Fallback works** (DuckDuckGo activates if others fail)
7. **Error handling works** (graceful degradation on failures)

## 🚀 Next Steps After Testing

1. **Set up production API keys** for Google/Bing
2. **Configure rate limiting** and monitoring
3. **Test with different user profiles**
4. **Validate search result quality**
5. **Monitor API usage and costs**
6. **Implement caching if needed**

## 📞 Support

If you encounter issues:
1. Check the logs for detailed error messages
2. Verify all dependencies are correctly configured
3. Test individual components separately
4. Refer to `SEARCH_SETUP.md` for API configuration
5. Check `REAL_SEARCH_IMPLEMENTATION.md` for architecture details
