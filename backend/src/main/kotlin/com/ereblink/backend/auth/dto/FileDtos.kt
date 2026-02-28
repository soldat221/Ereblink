package com.ereblink.backend.auth.dto

import java.time.Instant

data class FileItemDto(
    val id: Long,
    val originalName: String,
    val contentType: String,
    val size: Long,
    val createdAt: Instant
)

data class FileDetailDto(
    val id: Long,
    val originalName: String,
    val contentType: String,
    val size: Long,
    val createdAt: Instant,
    val ownerUsername: String
)