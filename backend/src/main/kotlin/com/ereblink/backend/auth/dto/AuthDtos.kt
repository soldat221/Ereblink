package com.ereblink.backend.auth.dto

import com.ereblink.backend.users.Role
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class RegisterRequest(
    @field:NotBlank
    @field:Size(min = 3, max = 50)
    val username: String,

    @field:NotBlank
    @field:Size(min = 6, max = 200)
    val password: String
)

data class LoginRequest(
    @field:NotBlank
    val username: String,

    @field:NotBlank
    val password: String
)

data class AuthResponse(
    val accessToken: String,
    val username: String,
    val role: Role
)