package com.buddyapp.models

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "game_history")
data class GameHistory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(name = "profile_id", nullable = false)
    val profileId: Long,
    
    @Column(name = "game_type", nullable = false)
    val gameType: String,
    
    @Column(name = "game_data", columnDefinition = "TEXT")
    val gameData: String? = null,
    
    @Column
    val score: Int? = null,
    
    @Column
    val timestamp: LocalDateTime = LocalDateTime.now()
)
