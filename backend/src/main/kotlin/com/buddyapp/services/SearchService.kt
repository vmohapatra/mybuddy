package com.buddyapp.services

import com.buddyapp.models.dto.SearchRequest
import com.buddyapp.models.dto.SearchResponse
import com.buddyapp.models.dto.SearchFeedbackRequest
import com.buddyapp.models.dto.SearchSource
// History persistence removed; frontend owns history now
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import com.buddyapp.services.RealSearchService

@Service
open class SearchService(
    private val llmService: LLMService,
    private val realSearchService: RealSearchService,
    private val searchPreferencesService: SearchPreferencesService
) {
    
    fun performSearch(request: SearchRequest): SearchResponse {
        try {
            // Get search preferences (use provided preferences or default)
            val preferences = request.preferences ?: searchPreferencesService.getDefaultPreferences()
            
            // Perform real search instead of using mock sources
            val realSources = realSearchService.performRealSearch(request.query, preferences.maxResults)
            
            // Apply search preferences and filters
            val filteredSources = searchPreferencesService.applyPreferences(realSources, preferences)
            
            // Generate AI overview using LLM service with filtered sources and preferences (tone, audience)
            val aiOverview = llmService.generateSearchOverview(request.query, filteredSources, preferences)
            
            // Generate key points based on filtered sources
            val keyPoints = generateKeyPointsFromSources(request.query, filteredSources)
            
            // Calculate confidence score based on filtered source quality and quantity
            val confidenceScore = calculateConfidenceScore(filteredSources)
            println("Debug: Calculated confidence score: $confidenceScore from ${filteredSources.size} sources")
            
            // Frontend owns history now; skip persistence here
            
            // Categorize sources by relevance
            val sortedSources = filteredSources.sortedByDescending { it.relevanceScore }
            val primarySources = sortedSources.take(3)
            val supportingResearch = sortedSources.drop(3).take(5)
            val additionalSources = sortedSources.drop(8)
            
            return SearchResponse(
                query = request.query,
                aiOverview = aiOverview,
                primarySources = primarySources,
                supportingResearch = supportingResearch,
                additionalSources = additionalSources,
                confidenceScore = confidenceScore,
                keyPoints = keyPoints,
                timestamp = LocalDateTime.now(),
                totalSources = filteredSources.size
            )
        } catch (e: Exception) {
            // Log the error
            println("Error performing search: ${e.message}")
            e.printStackTrace()
            
            // Return a fallback response with error information
            return SearchResponse(
                query = request.query,
                aiOverview = "Sorry, I encountered an error while searching. Please try again or check your search query.",
                primarySources = emptyList(),
                supportingResearch = emptyList(),
                additionalSources = emptyList(),
                confidenceScore = 0.0,
                keyPoints = listOf("Search encountered an error", "Please try again", "Check your query"),
                timestamp = LocalDateTime.now(),
                totalSources = 0
            )
        }
    }
    
    fun submitFeedback(request: SearchFeedbackRequest) {
        // TODO: Implement feedback storage
        println("Feedback submitted: ${request.rating} for query: ${request.query}")
    }
    
    
    private fun generateKeyPointsFromSources(query: String, sources: List<SearchSource>): List<String> {
        val keyPoints = mutableListOf<String>()
        val sourceTitles = sources.map { it.title }
        val uniqueTitles = sourceTitles.distinct()
        keyPoints.addAll(uniqueTitles.take(3)) // Take top 3 unique titles as key points
        return keyPoints
    }

    private fun calculateConfidenceScore(sources: List<SearchSource>): Double {
        if (sources.isEmpty()) return 0.0
        
        try {
            val totalRelevance = sources.sumOf { it.relevanceScore }
            val averageRelevance = totalRelevance / sources.size
            
            // Ensure the result is within valid bounds (0.0 to 1.0)
            return when {
                averageRelevance.isNaN() -> 0.0
                averageRelevance.isInfinite() -> 0.0
                averageRelevance < 0.0 -> 0.0
                averageRelevance > 1.0 -> 1.0
                else -> averageRelevance
            }
        } catch (e: Exception) {
            println("Error calculating confidence score: ${e.message}")
            return 0.0
        }
    }
}
