package com.buddyapp.config

import com.buddyapp.services.ConfigService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.ai.openai.OpenAiChatClient
import org.springframework.ai.openai.api.OpenAiApi

@Configuration
@ConditionalOnProperty(name = ["openai.enabled"], havingValue = "true", matchIfMissing = false)
open class OpenAiConfig(
    private val configService: ConfigService
) {
    
    @Bean
    @Primary
    @ConditionalOnProperty(name = ["openai.api-key"], matchIfMissing = false)
    open fun openAiChatClient(): OpenAiChatClient? {
        return if (configService.isOpenAiEnabled() && configService.getOpenAiApiKey().isNotBlank()) {
            val openAiApi = OpenAiApi(configService.getOpenAiApiKey())
            OpenAiChatClient(openAiApi)
        } else {
            null
        }
    }
}
