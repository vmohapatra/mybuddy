package com.buddyapp.models.dto

data class CreateProfileRequest(
    val email: String,
    val deviceId: String,
    val buddyName: String,
    val buddyPersonality: String,
    val buddyRules: String? = null
)

data class ProfileResponse(
    val id: Long,
    val email: String,
    val deviceId: String,
    val buddyName: String,
    val buddyPersonality: String,
    val buddyRules: String?,
    val createdAt: String,
    val updatedAt: String
)

data class ProfileListResponse(
    val profiles: List<ProfileResponse>
)
