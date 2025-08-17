package com.buddyapp.models

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "chat_history")
data class ChatMessage(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(name = "profile_id", nullable = false)
    val profileId: Long,
    
    @Column(nullable = false, columnDefinition = "TEXT")
    val message: String,
    
    @Column(name = "is_user_message", nullable = false)
    val isUserMessage: Boolean,
    
    @Column
    val timestamp: LocalDateTime = LocalDateTime.now()
)
