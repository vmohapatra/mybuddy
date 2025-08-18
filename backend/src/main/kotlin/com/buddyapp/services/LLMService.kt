package com.buddyapp.services

import com.buddyapp.models.dto.SearchSource
import com.buddyapp.models.dto.SearchPreferences
import org.springframework.ai.chat.ChatClient
import org.springframework.ai.chat.ChatResponse
import org.springframework.ai.chat.messages.Message
import org.springframework.ai.chat.messages.UserMessage
import org.springframework.ai.chat.messages.SystemMessage
import org.springframework.ai.chat.prompt.Prompt
import org.springframework.stereotype.Service

@Service
class LLMService(
    private val chatClient: ChatClient?
) {
    
    fun generateSearchOverview(query: String, sources: List<SearchSource>,  preferences: SearchPreferences): String {
        if (chatClient == null) {
            return "Based on the available sources, here's what I found about '$query': The search results indicate various perspectives and information related to your query. While I'm in offline mode, I can see that there are multiple sources available that could provide valuable insights."
        }
        
        val systemPrompt = buildSearchOverviewPrompt(query, sources, preferences)
        val userPrompt = UserMessage("Please provide a comprehensive overview of the search results for: $query")
        
        val prompt = Prompt(listOf(systemPrompt, userPrompt))
        val response: ChatResponse = chatClient.call(prompt)
        
        return response.result.output.content
    }
    
    private fun buildSearchOverviewPrompt(query: String, sources: List<SearchSource>, preferences: SearchPreferences): SystemMessage {
        val tone = preferences.tone
        val audience = preferences.audience ?: "general audience"

        // Convert sources to JSON-like string (safe formatting for prompt)
        val sourcesJson = sources.joinToString(",\n") { source ->
            """
            {
              "title": "${source.title}",
              "description": "${source.description}",
              "url": "${source.url}",
              "type": "${source.type}",
              "relevanceScore": ${source.relevanceScore}
            }
            """.trimIndent()
        }

        val prompt = """
        You are an AI search assistant analyzing search results for: "$query"

        Tone: $tone
        Audience: $audience

        The following JSON contains the available sources:
        [
        $sourcesJson
        ]

        Please provide a comprehensive, well-structured overview that:
        1. Summarizes the main findings
        2. Identifies key themes and patterns
        3. Highlights the most relevant information
        4. Provides actionable insights
        5. Maintains a professional yet accessible tone

        Structure your response in **Markdown** with the following sections:
        - **AI Summary**
        - **Key Information**
        - **Impact**
        - **Outlook**
        - **Sources**

        In the **Sources** section:
        - Always list the provided source titles with their actual URLs.
        - Do not invent or omit any URLs.
        - Keep the tone $tone and suitable for $audience throughout the response.
        """.trimIndent()

        return SystemMessage(prompt)
    }
}
