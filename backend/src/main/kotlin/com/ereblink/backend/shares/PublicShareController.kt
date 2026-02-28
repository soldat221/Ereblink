package com.ereblink.backend.shares

import com.ereblink.backend.shares.dto.PublicShareInfoResponse
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import jakarta.servlet.http.HttpServletRequest

@RestController
@RequestMapping("/api/public/share")
class PublicShareController(
    private val shareService: ShareService
) {
    @GetMapping("/{code}")
    fun info(@PathVariable code: String): PublicShareInfoResponse =
        shareService.getPublicInfo(code)

    @GetMapping("/{code}/download")
    fun download(@PathVariable code: String, request: HttpServletRequest): ResponseEntity<ByteArray> {
        val ip = request.getHeader("X-Forwarded-For")?.split(",")?.firstOrNull()?.trim()
            ?: request.remoteAddr
        val ua = request.getHeader("User-Agent")

        val dl = shareService.publicDownload(code, ip, ua)

        val encoded = URLEncoder.encode(dl.filename, StandardCharsets.UTF_8).replace("+", "%20")

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''$encoded")
            .contentType(MediaType.parseMediaType(dl.contentType))
            .body(dl.bytes)
    }
}