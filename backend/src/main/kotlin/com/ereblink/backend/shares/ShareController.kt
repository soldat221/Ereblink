package com.ereblink.backend.shares

import com.ereblink.backend.shares.dto.CreateShareRequest
import com.ereblink.backend.shares.dto.ShareCreatedResponse
import com.ereblink.backend.shares.dto.ShareListItemDto
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

    // moje share linky
    @GetMapping
    fun myShares(auth: Authentication): List<ShareListItemDto> =
        shareService.listMyShares(auth.name)

    // smazání share linku
    @DeleteMapping("/{id}")
    fun delete(auth: Authentication, @PathVariable id: Long) {
        shareService.deleteShare(auth.name, id)
    }
}