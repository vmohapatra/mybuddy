package com.buddyapp.services

import com.buddyapp.models.dto.SearchPreferences
import com.buddyapp.models.dto.SearchSource
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import org.slf4j.LoggerFactory

@Service
open class SearchPreferencesService {
    
    companion object {
        private val logger = LoggerFactory.getLogger(SearchPreferencesService::class.java)
    }
    
    /**
     * Apply search preferences and filters to search results
     */
    fun applyPreferences(sources: List<SearchSource>, preferences: SearchPreferences?): List<SearchSource> {
        if (preferences == null) return sources
        
        var filteredSources = sources.toMutableList()
        
        // Apply content type filtering
        if (preferences.contentTypes.isNotEmpty()) {
            filteredSources = filteredSources.filter { source ->
                preferences.contentTypes.any { contentType ->
                    source.type.contains(contentType, ignoreCase = true)
                }
            }.toMutableList()
            logger.debug("After content type filtering: ${filteredSources.size} sources")
        }
        
        // Apply preferred sources filtering
        if (preferences.preferredSources.isNotEmpty()) {
            filteredSources = filteredSources.filter { source ->
                preferences.preferredSources.any { preferredDomain ->
                    source.url.contains(preferredDomain)
                }
            }.toMutableList()
            logger.debug("After preferred sources filtering: ${filteredSources.size} sources")
        }
        
        // Apply excluded domains filtering
        if (preferences.excludedDomains.isNotEmpty()) {
            filteredSources = filteredSources.filter { source ->
                preferences.excludedDomains.none { excludedDomain ->
                    source.url.contains(excludedDomain)
                }
            }.toMutableList()
            logger.debug("After excluded domains filtering: ${filteredSources.size} sources")
        }
        
        // Apply academic-only filtering
        if (preferences.academicOnly) {
            filteredSources = filteredSources.filter { source ->
                source.url.contains(".edu") || 
                source.url.contains("arxiv.org") || 
                source.url.contains("researchgate.net") ||
                source.url.contains("scholar.google.com") ||
                source.type.contains("research_paper") ||
                source.type.contains("academic")
            }.toMutableList()
            logger.debug("After academic filtering: ${filteredSources.size} sources")
        }
        
        // Apply date filtering
        if (preferences.dateFrom != null || preferences.dateTo != null) {
            filteredSources = filteredSources.filter { source ->
                val sourceDate = source.publicationDate
                if (sourceDate == null) return@filter false
                
                try {
                    val date = LocalDate.parse(sourceDate, DateTimeFormatter.ISO_LOCAL_DATE)
                    
                    val fromDate = preferences.dateFrom?.let { 
                        LocalDate.parse(it, DateTimeFormatter.ISO_LOCAL_DATE) 
                    }
                    val toDate = preferences.dateTo?.let { 
                        LocalDate.parse(it, DateTimeFormatter.ISO_LOCAL_DATE) 
                    }
                    
                    (fromDate == null || date >= fromDate) && 
                    (toDate == null || date <= toDate)
                } catch (e: Exception) {
                    logger.warn("Failed to parse date: $sourceDate")
                    false
                }
            }.toMutableList()
            logger.debug("After date filtering: ${filteredSources.size} sources")
        }
        
        // Apply recent content filtering
        if (preferences.recentContentDays != null) {
            val cutoffDate = LocalDate.now().minusDays(preferences.recentContentDays.toLong())
            filteredSources = filteredSources.filter { source ->
                val sourceDate = source.publicationDate
                if (sourceDate == null) return@filter false
                
                try {
                    val date = LocalDate.parse(sourceDate, DateTimeFormatter.ISO_LOCAL_DATE)
                    date >= cutoffDate
                } catch (e: Exception) {
                    logger.warn("Failed to parse date for recent content: $sourceDate")
                    false
                }
            }.toMutableList()
            logger.debug("After recent content filtering: ${filteredSources.size} sources")
        }
        
        // Apply relevance score threshold
        filteredSources = filteredSources.filter { source ->
            source.relevanceScore >= preferences.minRelevanceScore
        }.toMutableList()
        logger.debug("After relevance filtering: ${filteredSources.size} sources")
        
        // Apply sorting
        filteredSources = when (preferences.sortOrder.lowercase()) {
            "date" -> filteredSources.sortedByDescending { 
                it.publicationDate?.let { date -> 
                    try { LocalDate.parse(date, DateTimeFormatter.ISO_LOCAL_DATE) } 
                    catch (e: Exception) { null } 
                } 
            }.toMutableList()
            "title" -> filteredSources.sortedBy { it.title.lowercase() }.toMutableList()
            else -> filteredSources.sortedByDescending { it.relevanceScore }.toMutableList()
        }
        
        // Apply max results limit
        if (filteredSources.size > preferences.maxResults) {
            filteredSources = filteredSources.take(preferences.maxResults).toMutableList()
        }
        
        logger.info("Applied preferences: ${sources.size} -> ${filteredSources.size} sources")
        return filteredSources
    }
    
    /**
     * Get default search preferences for a profile
     */
    fun getDefaultPreferences(): SearchPreferences {
        return SearchPreferences(
            preferredSources = emptyList(),
            contentTypes = emptyList(),
            language = "en",
            dateFrom = null,
            dateTo = null,
            minRelevanceScore = 0.3,
            maxResults = 20,
            preferredSearchEngines = emptyList(),
            excludedDomains = emptyList(),
            academicOnly = false,
            recentContentDays = null,
            sortOrder = "relevance"
        )
    }
    
    /**
     * Get academic-focused preferences
     */
    fun getAcademicPreferences(): SearchPreferences {
        return SearchPreferences(
            preferredSources = listOf("arxiv.org", "researchgate.net", ".edu", "scholar.google.com"),
            contentTypes = listOf("research_paper", "academic", "encyclopedia"),
            language = "en",
            dateFrom = null,
            dateTo = null,
            minRelevanceScore = 0.6,
            maxResults = 25,
            preferredSearchEngines = listOf("google", "bing"),
            excludedDomains = listOf("social-media.com", "blog-spam.com"),
            academicOnly = true,
            recentContentDays = 365,
            sortOrder = "relevance"
        )
    }
    
    /**
     * Get news-focused preferences
     */
    fun getNewsPreferences(): SearchPreferences {
        return SearchPreferences(
            preferredSources = listOf("bbc.com", "cnn.com", "reuters.com", "techcrunch.com"),
            contentTypes = listOf("news", "article", "blog"),
            language = "en",
            dateFrom = null,
            dateTo = null,
            minRelevanceScore = 0.4,
            maxResults = 15,
            preferredSearchEngines = listOf("google", "bing"),
            excludedDomains = emptyList(),
            academicOnly = false,
            recentContentDays = 30,
            sortOrder = "date"
        )
    }
    
    /**
     * Get technical documentation preferences
     */
    fun getTechnicalPreferences(): SearchPreferences {
        return SearchPreferences(
            preferredSources = listOf("github.com", "stackoverflow.com", "docs.microsoft.com", "developer.mozilla.org"),
            contentTypes = listOf("documentation", "code_repository", "qa_forum", "tutorial"),
            language = "en",
            dateFrom = null,
            dateTo = null,
            minRelevanceScore = 0.5,
            maxResults = 20,
            preferredSearchEngines = listOf("google", "bing"),
            excludedDomains = emptyList(),
            academicOnly = false,
            recentContentDays = 180,
            sortOrder = "relevance"
        )
    }
}
