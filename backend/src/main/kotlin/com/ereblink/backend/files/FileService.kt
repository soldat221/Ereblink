package com.ereblink.backend.files

import com.ereblink.backend.auth.dto.FileDetailDto
import com.ereblink.backend.auth.dto.FileItemDto
import com.ereblink.backend.shares.ShareLinkRepository
import com.ereblink.backend.users.UserRepository
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.Instant

data class FileDownload(
    val filename: String,
    val contentType: String,
    val bytes: ByteArray
)

@Service
class FileService(
    private val storedFileRepository: StoredFileRepository,
    private val userRepository: UserRepository,
    private val shareLinkRepository: ShareLinkRepository
) {

    @Transactional
    fun upload(currentUsername: String, file: MultipartFile): Long {
        require(!file.isEmpty) { "Soubor je prázdný" }

        val owner = userRepository.findByUsername(currentUsername)
            ?: throw IllegalArgumentException("Uživatel neexistuje")

        val originalName = file.originalFilename?.takeIf { it.isNotBlank() } ?: "upload.bin"
        val contentType = file.contentType ?: MediaType.APPLICATION_OCTET_STREAM_VALUE

        val bytes = file.bytes

        val entity = StoredFile(
            owner = owner,
            originalName = originalName,
            contentType = contentType,
            size = bytes.size.toLong(),
            data = bytes
        )

        return storedFileRepository.save(entity).id!!
    }

    @Transactional(readOnly = true)
    fun listMine(currentUsername: String): List<FileItemDto> =
        storedFileRepository.findAllByOwnerUsernameAndDeactivatedAtIsNullOrderByCreatedAtDesc(currentUsername)
            .map {
                FileItemDto(
                    id = it.id!!,
                    originalName = it.originalName,
                    contentType = it.contentType,
                    size = it.size,
                    createdAt = it.createdAt
                )
            }

    @Transactional(readOnly = true)
    fun downloadMine(currentUsername: String, id: Long): FileDownload {
        val f = storedFileRepository.findByIdAndOwnerUsernameAndDeactivatedAtIsNull(id, currentUsername)
            ?: throw IllegalArgumentException("Soubor nenalezen")

        return FileDownload(
            filename = f.originalName,
            contentType = f.contentType,
            bytes = f.data
        )
    }

    @Transactional
    fun deleteMine(currentUsername: String, id: Long) {
        val f = storedFileRepository.findByIdAndOwnerUsernameAndDeactivatedAtIsNull(id, currentUsername)
            ?: throw IllegalArgumentException("Soubor nenalezen")

        val now = Instant.now()

        val shares = shareLinkRepository.findAllByFileIdAndDeactivatedAtIsNullOrderByCreatedAtDesc(id)
        shares.forEach { it.deactivatedAt = now }

        f.deactivatedAt = now
    }

    @Transactional(readOnly = true)
    fun getMineDetail(currentUsername: String, id: Long): FileDetailDto {
        val f = storedFileRepository.findByIdAndOwnerUsernameAndDeactivatedAtIsNull(id, currentUsername)
            ?: throw IllegalArgumentException("Soubor nenalezen")

        return FileDetailDto(
            id = f.id!!,
            originalName = f.originalName,
            contentType = f.contentType,
            size = f.size,
            createdAt = f.createdAt,
            ownerUsername = f.owner.username
        )
    }
}
