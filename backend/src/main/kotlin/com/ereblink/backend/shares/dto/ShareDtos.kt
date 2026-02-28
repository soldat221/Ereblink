package com.ereblink.backend.shares.dto

import com.ereblink.backend.shares.AccessType
import jakarta.validation.constraints.NotNull
import java.time.Instant

data class CreateShareRequest(
    @field:NotNull
    val fileId: Long,

    val accessType: AccessType = AccessType.PUBLIC,

    // ISO instant, např. 2026-02-22T10:00:00Z; null = bez expirace
    val expiresAt: Instant? = null,

    // USER_ONLY (1 username)
    val allowedUsername: String? = null,

    // LIST (více username)
    val allowedUsernames: List<String>? = null
)

data class ShareCreatedResponse(
    val id: Long,
    val code: String,
    val accessType: AccessType,
    val expiresAt: Instant?
)

data class PublicShareInfoResponse(
    val code: String,
    val fileId: Long,
    val originalName: String,
    val contentType: String,
    val size: Long,
    val createdAt: Instant,
    val expiresAt: Instant?
)