package com.buddyapp.models.dto

import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDateTime

@Schema(description = "Search response with AI-generated summary and categorized sources")
data class SearchResponse(
    @Schema(description = "Search query that was executed")
    val query: String,
    
    @Schema(description = "AI-generated overview of search results")
    val aiOverview: String,
    
    @Schema(description = "Primary sources with highest relevance")
    val primarySources: List<SearchSource>,
    
    @Schema(description = "Supporting research sources")
    val supportingResearch: List<SearchSource>,
    
    @Schema(description = "Additional sources for further reading")
    val additionalSources: List<SearchSource>,
    
    @Schema(description = "Confidence score for AI analysis (0.0-1.0)")
    val confidenceScore: Double,
    
    @Schema(description = "Key points extracted from search results")
    val keyPoints: List<String>,
    
    @Schema(description = "Timestamp of search execution")
    val timestamp: LocalDateTime,
    
    @Schema(description = "Total number of sources found")
    val totalSources: Int
)

@Schema(description = "Individual search source with metadata")
data class SearchSource(
    @Schema(description = "Source title")
    val title: String,
    
    @Schema(description = "Source URL")
    val url: String,
    
    @Schema(description = "Source description or snippet")
    val description: String,
    
    @Schema(description = "Source type (article, video, paper, etc.)")
    val type: String,
    
    @Schema(description = "Relevance score (0.0-1.0)")
    val relevanceScore: Double,
    
    @Schema(description = "Publication date if available")
    val publicationDate: String? = null,
    
    @Schema(description = "Author or source organization")
    val author: String? = null
)
