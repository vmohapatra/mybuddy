package com.buddyapp.models.dto

data class ChatRequest(
    val profileId: Long,
    val message: String
)

data class ChatResponse(
    val message: String,
    val timestamp: String
)

data class ChatHistoryResponse(
    val messages: List<ChatMessageResponse>
)

data class ChatMessageResponse(
    val id: Long,
    val message: String,
    val isUserMessage: Boolean,
    val timestamp: String
)
