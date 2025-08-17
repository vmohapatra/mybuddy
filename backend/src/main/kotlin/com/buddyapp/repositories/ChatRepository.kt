package com.buddyapp.repositories

import com.buddyapp.models.ChatMessage
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface ChatRepository : JpaRepository<ChatMessage, Long> {
    
    @Query("SELECT c FROM ChatMessage c WHERE c.profileId = :profileId ORDER BY c.timestamp ASC")
    fun findByProfileIdOrderByTimestampAsc(@Param("profileId") profileId: Long): List<ChatMessage>
    
    @Query("SELECT c FROM ChatMessage c WHERE c.profileId = :profileId ORDER BY c.timestamp DESC LIMIT :limit")
    fun findRecentByProfileId(@Param("profileId") profileId: Long, @Param("limit") limit: Int): List<ChatMessage>
}
