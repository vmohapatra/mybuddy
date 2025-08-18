package com.buddyapp.models.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Search preferences and filters for customizing search results")
data class SearchPreferences(
    @Schema(description = "Preferred source domains (e.g., wikipedia.org, arxiv.org)")
    val preferredSources: List<String> = emptyList(),
    
    @Schema(description = "Content types to include (e.g., research_paper, news, blog, encyclopedia)")
    val contentTypes: List<String> = emptyList(),
    
    @Schema(description = "Language preference for search results")
    val language: String = "en",
    
    @Schema(description = "Start date for content filtering (ISO format)")
    val dateFrom: String? = null,
    
    @Schema(description = "End date for content filtering (ISO format)")
    val dateTo: String? = null,
    
    @Schema(description = "Minimum relevance score threshold (0.0-1.0)")
    val minRelevanceScore: Double = 0.3,
    
    @Schema(description = "Maximum number of results to return")
    val maxResults: Int = 20,
    
    @Schema(description = "Search engine preferences (google, bing, duckduckgo)")
    val preferredSearchEngines: List<String> = emptyList(),
    
    @Schema(description = "Exclude certain domains from results")
    val excludedDomains: List<String> = emptyList(),
    
    @Schema(description = "Include only academic/research sources")
    val academicOnly: Boolean = false,
    
    @Schema(description = "Include only recent content (within specified days)")
    val recentContentDays: Int? = null,
    
    @Schema(description = "Sort order for results (relevance, date, title)")
    val sortOrder: String = "relevance",

    @Schema(description = "Preferred tone for AI-generated summary (e.g., professional, friendly, playful, concise)")
    val tone: String = "professional",

    @Schema(description = "Intended audience for AI summary (optional, e.g., general public, experts)")
    val audience: String? = null
)
