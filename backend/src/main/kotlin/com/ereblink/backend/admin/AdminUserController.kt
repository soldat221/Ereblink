package com.ereblink.backend.admin

import com.ereblink.backend.admin.dto.AdminUserDto
import com.ereblink.backend.admin.dto.UpdateEnabledRequest
import com.ereblink.backend.admin.dto.UpdateRoleRequest
import jakarta.validation.Valid
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/users")
class AdminUserController(
    private val adminUserService: AdminUserService
) {

    @GetMapping
    fun list(): List<AdminUserDto> = adminUserService.listUsers()

    @PutMapping("/{id}/role")
    fun setRole(auth: Authentication, @PathVariable id: Long, @Valid @RequestBody req: UpdateRoleRequest) {
        adminUserService.setRole(id, req.role, auth.name)
    }

    @PutMapping("/{id}/enabled")
    fun setEnabled(auth: Authentication, @PathVariable id: Long, @Valid @RequestBody req: UpdateEnabledRequest) {
        adminUserService.setEnabled(id, req.enabled, auth.name)
    }

    @DeleteMapping("/{id}")
    fun delete(auth: Authentication, @PathVariable id: Long) {
        adminUserService.deleteUser(id, auth.name)
    }
}