package com.buddyapp.models

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "profiles")
data class Profile(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(nullable = false)
    val email: String,
    
    @Column(name = "device_id", nullable = false)
    val deviceId: String,
    
    @Column(name = "buddy_name", nullable = false)
    val buddyName: String,
    
    @Column(name = "buddy_personality", nullable = false, columnDefinition = "TEXT")
    val buddyPersonality: String,
    
    @Column(name = "buddy_rules", columnDefinition = "TEXT")
    val buddyRules: String? = null,
    
    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
