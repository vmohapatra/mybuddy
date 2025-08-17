package com.buddyapp.controllers

import com.buddyapp.models.dto.CreateProfileRequest
import com.buddyapp.models.dto.ProfileListResponse
import com.buddyapp.models.dto.ProfileResponse
import com.buddyapp.services.ProfileService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/profiles")
class ProfileController(
    private val profileService: ProfileService
) {
    
    @PostMapping
    fun createProfile(@RequestBody request: CreateProfileRequest): ResponseEntity<ProfileResponse> {
        val profile = profileService.createProfile(request)
        return ResponseEntity.ok(profile)
    }
    
    @GetMapping
    fun getProfiles(
        @RequestParam email: String,
        @RequestParam deviceId: String
    ): ResponseEntity<ProfileListResponse> {
        val profiles = profileService.getProfilesByEmailAndDevice(email, deviceId)
        return ResponseEntity.ok(ProfileListResponse(profiles))
    }
    
    @GetMapping("/{id}")
    fun getProfile(@PathVariable id: Long): ResponseEntity<ProfileResponse> {
        val profile = profileService.getProfileById(id)
        return if (profile != null) {
            ResponseEntity.ok(profile)
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    @DeleteMapping("/{id}")
    fun deleteProfile(@PathVariable id: Long): ResponseEntity<Unit> {
        val deleted = profileService.deleteProfile(id)
        return if (deleted) {
            ResponseEntity.ok().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }
}
