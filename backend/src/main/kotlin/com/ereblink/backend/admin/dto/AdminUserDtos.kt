package com.ereblink.backend.admin.dto

import com.ereblink.backend.users.Role
import jakarta.validation.constraints.NotNull

data class AdminUserDto(
    val id: Long,
    val username: String,
    val role: Role,
    val enabled: Boolean
)

data class UpdateRoleRequest(
    @field:NotNull
    val role: Role
)

data class UpdateEnabledRequest(
    @field:NotNull
    val enabled: Boolean
)