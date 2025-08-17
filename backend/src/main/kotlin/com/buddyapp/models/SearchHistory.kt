package com.buddyapp.models

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "search_history")
data class SearchHistory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(name = "profile_id", nullable = false)
    val profileId: Long,
    
    @Column(nullable = false, columnDefinition = "TEXT")
    val query: String,
    
    @Column(columnDefinition = "TEXT")
    val result: String? = null,
    
    @Column
    val timestamp: LocalDateTime = LocalDateTime.now()
)
