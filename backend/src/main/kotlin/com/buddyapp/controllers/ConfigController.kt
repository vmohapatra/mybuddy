package com.buddyapp.controllers

import com.buddyapp.models.dto.OpenAiConfigRequest
import com.buddyapp.models.dto.OpenAiConfigResponse
import com.buddyapp.services.ConfigService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/config")
@Tag(name = "Configuration", description = "Application configuration management - Set up OpenAI API keys and manage application settings")
open class ConfigController(
    private val configService: ConfigService
) {
    
    @GetMapping("/openai")
    @Operation(
        summary = "Get OpenAI Configuration",
        description = "Retrieve current OpenAI configuration status and settings. Use this to check if OpenAI is enabled and what model/parameters are configured."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Configuration retrieved successfully",
                content = [Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = OpenAiConfigResponse::class)
                )]
            )
        ]
    )
    fun getOpenAiConfig(): ResponseEntity<OpenAiConfigResponse> {
        val config = configService.getOpenAiConfig()
        return ResponseEntity.ok(config)
    }
    
    @PostMapping("/openai")
    @Operation(
        summary = "Update OpenAI Configuration",
        description = "Dynamically update OpenAI configuration without restarting the application. Required Fields: enabled (set to true to enable OpenAI integration). Optional Fields: apiKey (your OpenAI API key starting with 'sk-'), model (AI model like 'gpt-4o', 'gpt-3.5-turbo'), temperature (response creativity 0.0-2.0, recommended 0.7), maxTokens (maximum response length, recommended 1000-2000)."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Configuration updated successfully",
                content = [Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = OpenAiConfigResponse::class),
                    examples = [
                        ExampleObject(
                            name = "OpenAI Enabled",
                            value = "{\"enabled\": true, \"apiKeyConfigured\": true, \"model\": \"gpt-4o\", \"temperature\": 0.7, \"maxTokens\": 1000, \"lastUpdated\": \"2025-08-17T15:30:00\", \"status\": \"OpenAI is enabled and ready\"}"
                        ),
                        ExampleObject(
                            name = "OpenAI Disabled",
                            value = "{\"enabled\": false, \"apiKeyConfigured\": false, \"model\": \"gpt-3.5-turbo\", \"temperature\": 0.7, \"maxTokens\": 1000, \"lastUpdated\": \"2025-08-17T15:30:00\", \"status\": \"OpenAI is disabled\"}"
                        )
                    ]
                )]
            )
        ]
    )
    fun updateOpenAiConfig(
        @Parameter(
            description = "OpenAI configuration settings",
            required = true,
            content = [Content(
                mediaType = "application/json",
                schema = Schema(implementation = OpenAiConfigRequest::class)
            )]
        ) @RequestBody request: OpenAiConfigRequest
    ): ResponseEntity<OpenAiConfigResponse> {
        val config = configService.updateOpenAiConfig(request)
        return ResponseEntity.ok(config)
    }
    
    @PostMapping("/openai/enable")
    @Operation(
        summary = "Quick Enable OpenAI",
        description = "Quickly enable OpenAI integration using the existing API key. This is useful when you've already configured an API key and just want to turn AI features on."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "OpenAI enabled successfully",
                content = [Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = OpenAiConfigResponse::class)
                )]
            )
        ]
    )
    fun enableOpenAi(): ResponseEntity<OpenAiConfigResponse> {
        val config = configService.enableOpenAi()
        return ResponseEntity.ok(config)
    }
    
    @PostMapping("/openai/disable")
    @Operation(
        summary = "Quick Disable OpenAI",
        description = "Quickly disable OpenAI integration. This will turn off AI features but preserve your configuration for later use."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "OpenAI disabled successfully",
                content = [Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = OpenAiConfigResponse::class)
                )]
            )
        ]
    )
    fun disableOpenAi(): ResponseEntity<OpenAiConfigResponse> {
        val config = configService.disableOpenAi()
        return ResponseEntity.ok(config)
    }
    
    @GetMapping("/status")
    @Operation(
        summary = "Get Application Status",
        description = "Get overall application status including OpenAI configuration, database connectivity, and security status. Useful for monitoring and debugging."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Application status retrieved successfully",
                content = [Content(
                    mediaType = "application/json",
                    examples = [
                        ExampleObject(
                            name = "Application Status",
                            value = "{\"openai\": {\"enabled\": true, \"status\": \"OpenAI is enabled and ready\"}, \"database\": {\"status\": \"Connected\", \"type\": \"H2\"}, \"security\": {\"status\": \"Development mode\", \"authentication\": \"None required\"}, \"timestamp\": \"2025-08-17T15:30:00\"}}"
                        )
                    ]
                )]
            )
        ]
    )
    fun getApplicationStatus(): ResponseEntity<Map<String, Any>> {
        val status = configService.getApplicationStatus()
        return ResponseEntity.ok(status)
    }
}
