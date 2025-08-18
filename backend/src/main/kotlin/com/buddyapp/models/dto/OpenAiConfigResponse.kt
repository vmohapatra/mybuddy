package com.buddyapp.models.dto

import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDateTime

@Schema(
    description = "OpenAI Configuration Response - Current status and settings of your OpenAI integration",
    example = "{\"enabled\": true, \"apiKeyConfigured\": true, \"model\": \"gpt-4o\", \"temperature\": 0.7, \"maxTokens\": 1000, \"lastUpdated\": \"2025-08-17T15:30:00\", \"status\": \"OpenAI is enabled and ready\"}"
)
data class OpenAiConfigResponse(
    @Schema(
        description = "Whether OpenAI integration is currently enabled and active",
        example = "true"
    )
    val enabled: Boolean,
    
    @Schema(
        description = "Whether a valid OpenAI API key is configured and stored",
        example = "true"
    )
    val apiKeyConfigured: Boolean,
    
    @Schema(
        description = "The OpenAI model currently being used for AI responses",
        example = "gpt-4o"
    )
    val model: String,
    
    @Schema(
        description = "Current temperature setting for AI response creativity",
        example = "0.7"
    )
    val temperature: Double,
    
    @Schema(
        description = "Current maximum token limit for AI responses",
        example = "1000"
    )
    val maxTokens: Int,
    
    @Schema(
        description = "Timestamp of the last configuration update",
        example = "2025-08-17T15:30:00"
    )
    val lastUpdated: LocalDateTime,
    
    @Schema(
        description = "Human-readable status message describing the current OpenAI configuration state",
        example = "OpenAI is enabled and ready"
    )
    val status: String
)
