package com.buddyapp.models.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Search request with query and profile context")
data class SearchRequest(
    @Schema(description = "Search query text", example = "artificial intelligence trends 2024")
    val query: String,
    
    @Schema(description = "Profile ID for personalized search", example = "1")
    val profileId: Long,
    
    @Schema(description = "Search preferences and filters", required = false)
    val preferences: SearchPreferences? = null
)
