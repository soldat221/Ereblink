package com.ereblink.backend.shares

import com.ereblink.backend.shares.dto.PublicShareInfoResponse
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@RestController
@RequestMapping("/api/share")
class AuthenticatedShareController(
    private val shareService: ShareService
) {
    @GetMapping("/{code}")
    fun info(auth: Authentication, @PathVariable code: String): PublicShareInfoResponse =
        shareService.getInfoForUser(code, auth.name)

    @GetMapping("/{code}/download")
    fun download(
        auth: Authentication,
        @PathVariable code: String,
        request: HttpServletRequest
    ): ResponseEntity<ByteArray> {
        val ip = request.getHeader("X-Forwarded-For")?.split(",")?.firstOrNull()?.trim()
            ?: request.remoteAddr
        val ua = request.getHeader("User-Agent")

        val dl = shareService.downloadForUser(code, auth.name, ip, ua)
        val encoded = URLEncoder.encode(dl.filename, StandardCharsets.UTF_8).replace("+", "%20")

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''$encoded")
            .contentType(MediaType.parseMediaType(dl.contentType))
            .body(dl.bytes)
    }
}