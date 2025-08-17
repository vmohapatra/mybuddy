package com.buddyapp.services

import com.buddyapp.models.Profile
import com.buddyapp.models.dto.CreateProfileRequest
import com.buddyapp.models.dto.ProfileResponse
import com.buddyapp.repositories.ProfileRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.format.DateTimeFormatter

@Service
class ProfileService(
    private val profileRepository: ProfileRepository
) {
    
    @Transactional
    fun createProfile(request: CreateProfileRequest): ProfileResponse {
        // Check if profile already exists
        val existingProfile = profileRepository.findByEmailAndDeviceIdAndBuddyName(
            request.email, request.deviceId, request.buddyName
        )
        
        if (existingProfile != null) {
            throw IllegalArgumentException("Profile already exists for this email, device, and buddy name")
        }
        
        // Check device limit (max 3 profiles per device)
        val deviceProfileCount = profileRepository.countByEmailAndDeviceId(request.email, request.deviceId)
        if (deviceProfileCount >= 3) {
            throw IllegalArgumentException("Maximum of 3 profiles allowed per device")
        }
        
        val profile = Profile(
            email = request.email,
            deviceId = request.deviceId,
            buddyName = request.buddyName,
            buddyPersonality = request.buddyPersonality,
            buddyRules = request.buddyRules
        )
        
        val savedProfile = profileRepository.save(profile)
        return mapToResponse(savedProfile)
    }
    
    fun getProfilesByEmailAndDevice(email: String, deviceId: String): List<ProfileResponse> {
        val profiles = profileRepository.findByEmailAndDeviceId(email, deviceId)
        return profiles.map { mapToResponse(it) }
    }
    
    fun getProfileById(id: Long): ProfileResponse? {
        val profile = profileRepository.findById(id).orElse(null)
        return profile?.let { mapToResponse(it) }
    }
    
    @Transactional
    fun deleteProfile(id: Long): Boolean {
        if (profileRepository.existsById(id)) {
            profileRepository.deleteById(id)
            return true
        }
        return false
    }
    
    private fun mapToResponse(profile: Profile): ProfileResponse {
        val formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME
        return ProfileResponse(
            id = profile.id!!,
            email = profile.email,
            deviceId = profile.deviceId,
            buddyName = profile.buddyName,
            buddyPersonality = profile.buddyPersonality,
            buddyRules = profile.buddyRules,
            createdAt = profile.createdAt.format(formatter),
            updatedAt = profile.updatedAt.format(formatter)
        )
    }
}
