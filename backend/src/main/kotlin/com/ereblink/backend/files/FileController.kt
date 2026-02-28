package com.ereblink.backend.files

import com.ereblink.backend.auth.dto.FileDetailDto
import com.ereblink.backend.auth.dto.FileItemDto
import com.ereblink.backend.shares.ShareService
import com.ereblink.backend.shares.dto.ShareListItemDto
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@RestController
@RequestMapping("/api/files")
class FileController(
    private val fileService: FileService,
    private val shareService: ShareService
) {

    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun upload(
        auth: Authentication,
        @RequestPart("file") file: MultipartFile
    ): Map<String, Any> {
        val id = fileService.upload(auth.name, file)
        return mapOf("id" to id)
    }

    @GetMapping
    fun listMine(auth: Authentication): List<FileItemDto> =
        fileService.listMine(auth.name)

    @GetMapping("/{id}/download")
    fun downloadMine(
        auth: Authentication,
        @PathVariable id: Long
    ): ResponseEntity<ByteArray> {
        val dl = fileService.downloadMine(auth.name, id)

        // Bezpečné kódování názvu souboru
        val encoded = URLEncoder.encode(dl.filename, StandardCharsets.UTF_8).replace("+", "%20")

        return ResponseEntity.ok()
            .header(
                HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename*=UTF-8''$encoded"
            )
            .contentType(MediaType.parseMediaType(dl.contentType))
            .body(dl.bytes)
    }

    @GetMapping("/{id}")
    fun getDetail(auth: Authentication, @PathVariable id: Long): FileDetailDto =
        fileService.getMineDetail(auth.name, id)

    @DeleteMapping("/{id}")
    fun deleteMine(auth: Authentication, @PathVariable id: Long) {
        fileService.deleteMine(auth.name, id)
    }

    @GetMapping("/{id}/shares")
    fun listSharesForFile(auth: Authentication, @PathVariable id: Long): List<ShareListItemDto> =
        shareService.listSharesForFile(auth.name, id)
}