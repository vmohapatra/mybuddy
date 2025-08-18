package com.buddyapp.services

import com.buddyapp.models.dto.OpenAiConfigRequest
import com.buddyapp.models.dto.OpenAiConfigResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
open class ConfigService {
    
    @Value("\${openai.enabled:false}")
    private var openAiEnabled: Boolean = false
    
    @Value("\${openai.api-key:}")
    private var openAiApiKey: String = ""
    
    @Value("\${openai.model:gpt-3.5-turbo}")
    private var openAiModel: String = "gpt-3.5-turbo"
    
    @Value("\${openai.temperature:0.7}")
    private var openAiTemperature: Double = 0.7
    
    @Value("\${openai.max-tokens:1000}")
    private var openAiMaxTokens: Int = 1000
    
    private var lastConfigUpdate: LocalDateTime = LocalDateTime.now()
    
    fun getOpenAiConfig(): OpenAiConfigResponse {
        return OpenAiConfigResponse(
            enabled = openAiEnabled,
            apiKeyConfigured = openAiApiKey.isNotBlank(),
            model = openAiModel,
            temperature = openAiTemperature,
            maxTokens = openAiMaxTokens,
            lastUpdated = lastConfigUpdate,
            status = buildStatusMessage()
        )
    }
    
    fun updateOpenAiConfig(request: OpenAiConfigRequest): OpenAiConfigResponse {
        // Update configuration
        openAiEnabled = request.enabled
        request.apiKey?.let { if (it.isNotBlank()) openAiApiKey = it }
        request.model?.let { if (it.isNotBlank()) openAiModel = it }
        request.temperature?.let { openAiTemperature = it }
        request.maxTokens?.let { openAiMaxTokens = it }
        
        lastConfigUpdate = LocalDateTime.now()
        
        return getOpenAiConfig()
    }
    
    fun enableOpenAi(): OpenAiConfigResponse {
        if (openAiApiKey.isBlank()) {
            throw IllegalStateException("Cannot enable OpenAI without an API key. Please set the API key first.")
        }
        
        openAiEnabled = true
        lastConfigUpdate = LocalDateTime.now()
        
        return getOpenAiConfig()
    }
    
    fun disableOpenAi(): OpenAiConfigResponse {
        openAiEnabled = false
        lastConfigUpdate = LocalDateTime.now()
        
        return getOpenAiConfig()
    }
    
    fun getApplicationStatus(): Map<String, Any> {
        return mapOf(
            "application" to mapOf(
                "name" to "MyBuddy Backend",
                "version" to "1.0.0",
                "status" to "RUNNING",
                "startTime" to LocalDateTime.now().minusHours(1) // Approximate
            ),
            "openai" to mapOf(
                "enabled" to openAiEnabled,
                "apiKeyConfigured" to openAiApiKey.isNotBlank(),
                "model" to openAiModel,
                "status" to if (openAiEnabled && openAiApiKey.isNotBlank()) "READY" else "DISABLED"
            ),
            "database" to mapOf(
                "type" to "H2",
                "status" to "CONNECTED",
                "url" to "jdbc:h2:mem:testdb"
            ),
            "security" to mapOf(
                "enabled" to true,
                "mode" to "DEVELOPMENT",
                "cors" to "ENABLED"
            ),
            "lastConfigUpdate" to lastConfigUpdate
        )
    }
    
    private fun buildStatusMessage(): String {
        return when {
            openAiEnabled && openAiApiKey.isNotBlank() -> "OpenAI is enabled and ready for use"
            openAiEnabled && openAiApiKey.isBlank() -> "OpenAI is enabled but no API key is configured"
            else -> "OpenAI is disabled"
        }
    }
    
    // Getter methods for other services to access current configuration
    fun isOpenAiEnabled(): Boolean = openAiEnabled
    fun getOpenAiApiKey(): String = openAiApiKey
    fun getOpenAiModel(): String = openAiModel
    fun getOpenAiTemperature(): Double = openAiTemperature
    fun getOpenAiMaxTokens(): Int = openAiMaxTokens
}
