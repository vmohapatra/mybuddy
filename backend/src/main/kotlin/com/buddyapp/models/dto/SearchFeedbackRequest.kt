package com.buddyapp.models.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Request to submit search feedback")
data class SearchFeedbackRequest(
    @Schema(description = "Search query that received feedback")
    val query: String,
    
    @Schema(description = "Profile ID of the user")
    val profileId: Long,
    
    @Schema(description = "Feedback rating", example = "positive")
    val rating: String,
    
    @Schema(description = "Additional feedback comments")
    val comments: String? = null,
    
    @Schema(description = "Whether the search results were helpful")
    val wasHelpful: Boolean,
    
    @Schema(description = "Specific issues or suggestions")
    val suggestions: String? = null
)
