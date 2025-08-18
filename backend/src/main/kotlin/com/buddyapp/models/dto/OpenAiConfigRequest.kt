package com.buddyapp.models.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(
    description = "OpenAI Configuration Request - Use this to set up or update your OpenAI integration",
    example = "{\"enabled\": true, \"apiKey\": \"example-api-key\", \"model\": \"gpt-4o\", \"temperature\": 0.7, \"maxTokens\": 1000}"
)
data class OpenAiConfigRequest(
    @Schema(
        description = "Whether OpenAI integration should be enabled. Set to 'true' to activate AI features.",
        example = "true",
        required = true
    )
    val enabled: Boolean,
    
    @Schema(
        description = "Your OpenAI API key. Must start with 'sk-' and be valid. Leave null to use existing key.",
        example = "example-api-key",
        nullable = true
    )
    val apiKey: String? = null,
    
    @Schema(
        description = "OpenAI model to use for AI responses. Popular options: 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'",
        example = "gpt-4o",
        nullable = true
    )
    val model: String? = null,
    
    @Schema(
        description = "Temperature controls response randomness. 0.0 = focused/consistent, 1.0 = creative/varied. Recommended: 0.7",
        example = "0.7",
        minimum = "0.0",
        maximum = "2.0",
        nullable = true
    )
    val temperature: Double? = null,
    
    @Schema(
        description = "Maximum number of tokens in AI responses. Higher values = longer responses. Recommended: 1000-2000",
        example = "1000",
        minimum = "1",
        maximum = "4000",
        nullable = true
    )
    val maxTokens: Int? = null
)
