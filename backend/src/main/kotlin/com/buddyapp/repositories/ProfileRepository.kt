package com.buddyapp.repositories

import com.buddyapp.models.Profile
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface ProfileRepository : JpaRepository<Profile, Long> {
    
    @Query("SELECT p FROM Profile p WHERE p.email = :email AND p.deviceId = :deviceId")
    fun findByEmailAndDeviceId(@Param("email") email: String, @Param("deviceId") deviceId: String): List<Profile>
    
    @Query("SELECT COUNT(p) FROM Profile p WHERE p.email = :email AND p.deviceId = :deviceId")
    fun countByEmailAndDeviceId(@Param("email") email: String, @Param("deviceId") deviceId: String): Long
    
    @Query("SELECT p FROM Profile p WHERE p.email = :email AND p.deviceId = :deviceId AND p.buddyName = :buddyName")
    fun findByEmailAndDeviceIdAndBuddyName(
        @Param("email") email: String, 
        @Param("deviceId") deviceId: String, 
        @Param("buddyName") buddyName: String
    ): Profile?
}
