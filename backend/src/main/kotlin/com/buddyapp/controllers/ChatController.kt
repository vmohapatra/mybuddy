package com.buddyapp.controllers

import com.buddyapp.models.dto.ChatRequest
import com.buddyapp.models.dto.ChatResponse
import com.buddyapp.models.dto.ChatHistoryResponse
import com.buddyapp.models.dto.ChatMessageResponse
import com.buddyapp.models.Profile
import com.buddyapp.services.LLMService
import com.buddyapp.services.ProfileService
import com.buddyapp.repositories.ChatRepository
import com.buddyapp.models.ChatMessage
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.format.DateTimeFormatter

@RestController
@RequestMapping("/api/chat")
class ChatController(
    private val llmService: LLMService,
    private val profileService: ProfileService,
    private val chatRepository: ChatRepository
) {
    
    @PostMapping("/send")
    fun sendMessage(@RequestBody request: ChatRequest): ResponseEntity<ChatResponse> {
        val profile = profileService.getProfileById(request.profileId)?.let { profileResponse ->
            Profile(
                id = profileResponse.id,
                email = profileResponse.email,
                deviceId = profileResponse.deviceId,
                buddyName = profileResponse.buddyName,
                buddyPersonality = profileResponse.buddyPersonality,
                buddyRules = profileResponse.buddyRules
            )
        } ?: return ResponseEntity.notFound().build()
        
        // Save user message
        val userMessage = ChatMessage(
            profileId = request.profileId,
            message = request.message,
            isUserMessage = true
        )
        chatRepository.save(userMessage)
        
        // Get chat history for context
        val chatHistory = chatRepository.findByProfileIdOrderByTimestampAsc(request.profileId)
            .map { it.message }
        
        // Generate AI response
        val aiResponse = llmService.generateChatResponse(profile, request.message, chatHistory)
        
        // Save AI response
        val aiMessage = ChatMessage(
            profileId = request.profileId,
            message = aiResponse,
            isUserMessage = false
        )
        chatRepository.save(aiMessage)
        
        val response = ChatResponse(
            message = aiResponse,
            timestamp = aiMessage.timestamp.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        )
        
        return ResponseEntity.ok(response)
    }
    
    @GetMapping("/history/{profileId}")
    fun getChatHistory(@PathVariable profileId: Long): ResponseEntity<ChatHistoryResponse> {
        val messages = chatRepository.findByProfileIdOrderByTimestampAsc(profileId)
        
        val messageResponses = messages.map { message ->
            ChatMessageResponse(
                id = message.id!!,
                message = message.message,
                isUserMessage = message.isUserMessage,
                timestamp = message.timestamp.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            )
        }
        
        return ResponseEntity.ok(ChatHistoryResponse(messageResponses))
    }
}
