package com.ereblink.backend.shares

import com.ereblink.backend.shares.dto.CreateShareRequest
import com.ereblink.backend.shares.dto.ShareCreatedResponse
import jakarta.validation.Valid
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/shares")
class ShareController(
    private val shareService: ShareService
) {
    @PostMapping
    fun create(auth: Authentication, @Valid @RequestBody req: CreateShareRequest): ShareCreatedResponse =
        shareService.createShare(auth.name, req)
}