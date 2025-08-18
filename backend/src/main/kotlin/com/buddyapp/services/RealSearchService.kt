package com.buddyapp.services

import com.buddyapp.models.dto.SearchSource
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory

@Service
open class RealSearchService(
    private val restTemplate: RestTemplate,
    private val objectMapper: ObjectMapper
) {
    
    companion object {
        private val logger = LoggerFactory.getLogger(RealSearchService::class.java)
    }
    
    @Value("\${search.google.api.key:}")
    private lateinit var googleApiKey: String
    
    @Value("\${search.google.search.engine.id:}")
    private lateinit var googleSearchEngineId: String
    
    @Value("\${search.bing.api.key:}")
    private lateinit var bingApiKey: String
    
    @Value("\${search.duckduckgo.enabled:true}")
    private var duckDuckGoEnabled: Boolean = true
    
    /**
     * Perform real search using multiple search engines
     */
    fun performRealSearch(query: String, maxResults: Int = 20): List<SearchSource> {
        val allSources = mutableListOf<SearchSource>()
        
        try {
            // Try Google Custom Search first (if configured)
            if (googleApiKey.isNotBlank() && googleSearchEngineId.isNotBlank()) {
                val googleResults = searchGoogle(query, maxResults)
                allSources.addAll(googleResults)
                logger.info("Google search returned ${googleResults.size} results")
            }
            
            // Try Bing Search (if configured)
            if (bingApiKey.isNotBlank()) {
                val bingResults = searchBing(query, maxResults)
                allSources.addAll(bingResults)
                logger.info("Bing search returned ${bingResults.size} results")
            }
            
            // Fallback to DuckDuckGo (free, no API key required)
            if (duckDuckGoEnabled && allSources.isEmpty()) {
                val duckDuckGoResults = searchDuckDuckGo(query, maxResults)
                allSources.addAll(duckDuckGoResults)
                logger.info("DuckDuckGo search returned ${duckDuckGoResults.size} results")
            }
            
        } catch (e: Exception) {
            logger.error("Error performing real search: ${e.message}", e)
            // Fallback to DuckDuckGo if other services fail
            if (duckDuckGoEnabled) {
                try {
                    val fallbackResults = searchDuckDuckGo(query, maxResults)
                    allSources.addAll(fallbackResults)
                    logger.info("Fallback DuckDuckGo search returned ${fallbackResults.size} results")
                } catch (fallbackError: Exception) {
                    logger.error("Fallback search also failed: ${fallbackError.message}", fallbackError)
                }
            }
        }
        
        // Remove duplicates and sort by relevance
        return allSources.distinctBy { it.url }
            .sortedByDescending { it.relevanceScore }
            .take(maxResults)
    }
    
    /**
     * Google Custom Search API
     */
    private fun searchGoogle(query: String, maxResults: Int): List<SearchSource> {
        try {
            val url = "https://www.googleapis.com/customsearch/v1"
            val params = mapOf(
                "key" to googleApiKey,
                "cx" to googleSearchEngineId,
                "q" to query,
                "num" to maxResults.toString()
            )
            
            val response = restTemplate.getForObject(
                "$url?key={key}&cx={cx}&q={q}&num={num}",
                String::class.java,
                params
            )
            
            return parseGoogleResults(response)
        } catch (e: Exception) {
            logger.error("Google search failed: ${e.message}", e)
            return emptyList()
        }
    }
    
    /**
     * Bing Search API
     */
    private fun searchBing(query: String, maxResults: Int): List<SearchSource> {
        try {
            val url = "https://api.bing.microsoft.com/v7.0/search"
            val headers = HttpHeaders()
            headers.set("Ocp-Apim-Subscription-Key", bingApiKey)
            
            val params = mapOf(
                "q" to query,
                "count" to maxResults.toString(),
                "mkt" to "en-US"
            )
            
            val entity = HttpEntity<Any>(headers)
            val response = restTemplate.exchange(
                "$url?q={q}&count={count}&mkt={mkt}",
                HttpMethod.GET,
                entity,
                String::class.java,
                params
            )
            
            return parseBingResults(response.body)
        } catch (e: Exception) {
            logger.error("Bing search failed: ${e.message}", e)
            return emptyList()
        }
    }
    
    /**
     * DuckDuckGo Instant Answer API (free, no API key required)
     */
    private fun searchDuckDuckGo(query: String, maxResults: Int): List<SearchSource> {
        try {
            val url = "https://api.duckduckgo.com/"
            val params = mapOf(
                "q" to query,
                "format" to "json",
                "no_html" to "1",
                "skip_disambig" to "1"
            )
            
            val response = restTemplate.getForObject(
                "$url?q={q}&format={format}&no_html={no_html}&skip_disambig={skip_disambig}",
                String::class.java,
                params
            )
            
            return parseDuckDuckGoResults(response, query, maxResults)
        } catch (e: Exception) {
            logger.error("DuckDuckGo search failed: ${e.message}", e)
            return emptyList()
        }
    }
    
    /**
     * Parse Google Custom Search results
     */
    private fun parseGoogleResults(jsonResponse: String?): List<SearchSource> {
        if (jsonResponse.isNullOrBlank()) return emptyList()
        
        return try {
            val jsonNode = objectMapper.readTree(jsonResponse)
            val items = jsonNode.get("items") ?: return emptyList()
            
            items.mapNotNull { item ->
                try {
                    SearchSource(
                        title = item.get("title")?.asText() ?: "",
                        url = item.get("link")?.asText() ?: "",
                        description = item.get("snippet")?.asText() ?: "",
                        type = determineSourceType(item.get("link")?.asText() ?: ""),
                        relevanceScore = calculateRelevanceScore(item),
                        publicationDate = item.get("pagemap")?.get("metatags")?.firstOrNull()?.get("article:published_time")?.asText(),
                        author = item.get("pagemap")?.get("metatags")?.firstOrNull()?.get("author")?.asText()
                    )
                } catch (e: Exception) {
                    logger.warn("Failed to parse Google search result: ${e.message}")
                    null
                }
            }
        } catch (e: Exception) {
            logger.error("Failed to parse Google search response: ${e.message}", e)
            emptyList()
        }
    }
    
    /**
     * Parse Bing Search results
     */
    private fun parseBingResults(jsonResponse: String?): List<SearchSource> {
        if (jsonResponse.isNullOrBlank()) return emptyList()
        
        return try {
            val jsonNode = objectMapper.readTree(jsonResponse)
            val webPages = jsonNode.get("webPages")?.get("value") ?: return emptyList()
            
            webPages.mapNotNull { item ->
                try {
                    SearchSource(
                        title = item.get("name")?.asText() ?: "",
                        url = item.get("url")?.asText() ?: "",
                        description = item.get("snippet")?.asText() ?: "",
                        type = determineSourceType(item.get("url")?.asText() ?: ""),
                        relevanceScore = calculateRelevanceScore(item),
                        publicationDate = null, // Bing doesn't provide this in basic response
                        author = null
                    )
                } catch (e: Exception) {
                    logger.warn("Failed to parse Bing search result: ${e.message}")
                    null
                }
            }
        } catch (e: Exception) {
            logger.error("Failed to parse Bing search response: ${e.message}", e)
            emptyList()
        }
    }
    
    /**
     * Parse DuckDuckGo results
     */
    private fun parseDuckDuckGoResults(jsonResponse: String?, query: String, maxResults: Int): List<SearchSource> {
        if (jsonResponse.isNullOrBlank()) return emptyList()
        
        return try {
            val jsonNode = objectMapper.readTree(jsonResponse)
            val sources = mutableListOf<SearchSource>()
            
            // Add abstract source if available
            jsonNode.get("AbstractURL")?.asText()?.let { url ->
                if (url.isNotBlank() && url != "N/A") {
                    sources.add(
                        SearchSource(
                            title = jsonNode.get("Abstract")?.asText() ?: query,
                            url = url,
                            description = jsonNode.get("AbstractText")?.asText() ?: "",
                            type = "information",
                            relevanceScore = 0.95,
                            publicationDate = null,
                            author = null
                        )
                    )
                }
            }
            
            // Add related topics
            jsonNode.get("RelatedTopics")?.forEach { topic ->
                if (sources.size < maxResults) {
                    val topicNode = topic as? com.fasterxml.jackson.databind.JsonNode
                    topicNode?.get("FirstURL")?.asText()?.let { url ->
                        if (url.isNotBlank() && url != "N/A") {
                            sources.add(
                                SearchSource(
                                    title = topicNode.get("Text")?.asText() ?: query,
                                    url = url,
                                    description = topicNode.get("Text")?.asText() ?: "",
                                    type = "related_topic",
                                    relevanceScore = 0.8,
                                    publicationDate = null,
                                    author = null
                                )
                            )
                        }
                    }
                }
            }
            
            sources.take(maxResults)
        } catch (e: Exception) {
            logger.error("Failed to parse DuckDuckGo search response: ${e.message}", e)
            emptyList()
        }
    }
    
    /**
     * Determine source type based on URL
     */
    private fun determineSourceType(url: String): String {
        return when {
            url.contains("wikipedia.org") -> "encyclopedia"
            url.contains("arxiv.org") || url.contains("researchgate.net") -> "research_paper"
            url.contains("github.com") -> "code_repository"
            url.contains("stackoverflow.com") -> "qa_forum"
            url.contains("medium.com") || url.contains("dev.to") -> "blog"
            url.contains(".edu") -> "academic"
            url.contains(".gov") -> "government"
            url.contains("news.") || url.contains("bbc.com") || url.contains("cnn.com") -> "news"
            else -> "web_page"
        }
    }
    
    /**
     * Calculate relevance score based on search result data
     */
    private fun calculateRelevanceScore(item: com.fasterxml.jackson.databind.JsonNode): Double {
        var score = 0.5 // Base score
        
        // Boost for exact title matches
        val title = item.get("title")?.asText() ?: ""
        if (title.isNotBlank()) score += 0.2
        
        // Boost for detailed descriptions
        val description = item.get("snippet")?.asText() ?: ""
        if (description.length > 100) score += 0.1
        
        // Boost for recent content (if available)
        val date = item.get("pagemap")?.get("metatags")?.firstOrNull()?.get("article:published_time")?.asText()
        if (!date.isNullOrBlank()) score += 0.1
        
        // Boost for authoritative domains
        val url = item.get("link")?.asText() ?: item.get("url")?.asText() ?: ""
        when {
            url.contains("wikipedia.org") -> score += 0.2
            url.contains("arxiv.org") -> score += 0.2
            url.contains(".edu") -> score += 0.15
            url.contains(".gov") -> score += 0.15
            url.contains("github.com") -> score += 0.1
        }
        
        return score.coerceIn(0.0, 1.0)
    }
}
