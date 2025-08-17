package com.buddyapp.services

import com.buddyapp.models.Profile
import org.springframework.ai.chat.ChatClient
import org.springframework.ai.chat.ChatResponse
import org.springframework.ai.chat.messages.Message
import org.springframework.ai.chat.messages.UserMessage
import org.springframework.ai.chat.messages.SystemMessage
import org.springframework.ai.chat.prompt.Prompt
import org.springframework.stereotype.Service

@Service
class LLMService(
    private val chatClient: ChatClient
) {
    
    fun generateChatResponse(profile: Profile, userMessage: String, chatHistory: List<String>): String {
        val systemPrompt = buildSystemPrompt(profile, chatHistory)
        val userPrompt = UserMessage(userMessage)
        
        val prompt = Prompt(listOf(systemPrompt, userPrompt))
        val response: ChatResponse = chatClient.call(prompt)
        
        return response.result.output.content
    }
    
    fun generateSearchResponse(profile: Profile, query: String): String {
        val systemPrompt = buildSearchPrompt(profile, query)
        val userPrompt = UserMessage("Please help me with this search query: $query")
        
        val prompt = Prompt(listOf(systemPrompt, userPrompt))
        val response: ChatResponse = chatClient.call(prompt)
        
        return response.result.output.content
    }
    
    fun generateGameResponse(profile: Profile, gameType: String, gameData: String?): String {
        val systemPrompt = buildGamePrompt(profile, gameType, gameData)
        val userPrompt = UserMessage("Let's play a $gameType game!")
        
        val prompt = Prompt(listOf(systemPrompt, userPrompt))
        val response: ChatResponse = chatClient.call(prompt)
        
        return response.result.output.content
    }
    
    private fun buildSystemPrompt(profile: Profile, chatHistory: List<String>): SystemMessage {
        val personality = profile.buddyPersonality
        val rules = profile.buddyRules ?: ""
        val historyContext = if (chatHistory.isNotEmpty()) {
            "Previous conversation context: ${chatHistory.takeLast(5).joinToString(" | ")}"
        } else ""
        
        val prompt = """
            You are ${profile.buddyName}, a buddy with the following personality: $personality
            
            $rules
            
            $historyContext
            
            Always stay in character as ${profile.buddyName}. Be helpful, engaging, and true to your personality.
            Keep responses conversational and appropriate for a buddy relationship.
        """.trimIndent()
        
        return SystemMessage(prompt)
    }
    
    private fun buildSearchPrompt(profile: Profile, query: String): SystemMessage {
        val personality = profile.buddyPersonality
        val rules = profile.buddyRules ?: ""
        
        val prompt = """
            You are ${profile.buddyName}, helping with a search query: "$query"
            
            Personality: $personality
            Rules: $rules
            
            Provide helpful, relevant information while maintaining your buddy personality.
            Be informative but also friendly and supportive.
        """.trimIndent()
        
        return SystemMessage(prompt)
    }
    
    private fun buildGamePrompt(profile: Profile, gameType: String, gameData: String?): SystemMessage {
        val personality = profile.buddyPersonality
        val rules = profile.buddyRules ?: ""
        val gameContext = gameData ?: ""
        
        val prompt = """
            You are ${profile.buddyName}, playing a $gameType game with your buddy.
            
            Personality: $personality
            Rules: $rules
            Game Context: $gameContext
            
            Be enthusiastic and engaging about the game. Make it fun and interactive.
            Stay in character and make the game experience enjoyable.
        """.trimIndent()
        
        return SystemMessage(prompt)
    }
}
