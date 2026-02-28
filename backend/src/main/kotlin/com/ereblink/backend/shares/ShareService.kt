package com.ereblink.backend.shares

import com.ereblink.backend.files.StoredFileRepository
import com.ereblink.backend.logs.DownloadLog
import com.ereblink.backend.logs.DownloadLogRepository
import com.ereblink.backend.shares.dto.CreateShareRequest
import com.ereblink.backend.shares.dto.ShareCreatedResponse
import com.ereblink.backend.shares.dto.PublicShareInfoResponse
import com.ereblink.backend.shares.dto.ShareListItemDto
import com.ereblink.backend.users.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.SecureRandom
import java.time.Instant
import java.util.Base64

data class PublicDownload(
    val filename: String,
    val contentType: String,
    val bytes: ByteArray
)

@Service
class ShareService(
    private val storedFileRepository: StoredFileRepository,
    private val shareLinkRepository: ShareLinkRepository,
    private val sharePermissionRepository: SharePermissionRepository,
    private val userRepository: UserRepository,
    private val downloadLogRepository: DownloadLogRepository
) {
    private val rnd = SecureRandom()

    private fun generateCode(): String {
        val bytes = ByteArray(18)
        rnd.nextBytes(bytes)
        // URL-safe, bez paddingu
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }

    @Transactional
    fun createShare(currentUsername: String, req: CreateShareRequest): ShareCreatedResponse {
        val file = storedFileRepository.findById(req.fileId)
            .orElseThrow { IllegalArgumentException("Soubor nenalezen") }

        if (file.owner.username != currentUsername) {
            throw IllegalArgumentException("Nemáš oprávnění sdílet tento soubor")
        }

        val creator = userRepository.findByUsername(currentUsername)
            ?: throw IllegalArgumentException("Uživatel neexistuje")

        if (req.expiresAt != null && req.expiresAt.isBefore(Instant.now())) {
            throw IllegalArgumentException("Expirace nesmí být v minulosti")
        }

        var code: String
        do { code = generateCode() } while (shareLinkRepository.existsByCode(code))

        val accessType = req.accessType

        val allowedUser = when (accessType) {
            AccessType.USER_ONLY -> {
                val uname = req.allowedUsername?.trim().takeIf { !it.isNullOrBlank() }
                    ?: throw IllegalArgumentException("allowedUsername je povinný pro USER_ONLY")
                userRepository.findByUsername(uname)
                    ?: throw IllegalArgumentException("Uživatel '$uname' neexistuje")
            }
            else -> null
        }

        val share = ShareLink(
            code = code,
            file = file,
            createdBy = creator,
            accessType = accessType,
            allowedUser = allowedUser,
            expiresAt = req.expiresAt
        )

        val saved = shareLinkRepository.save(share)

        // LIST permissions
        if (accessType == AccessType.LIST) {
            val names = req.allowedUsernames?.map { it.trim() }?.filter { it.isNotBlank() } ?: emptyList()
            if (names.isEmpty()) throw IllegalArgumentException("allowedUsernames je povinné pro LIST")

            val users = names.map { uname ->
                userRepository.findByUsername(uname)
                    ?: throw IllegalArgumentException("Uživatel '$uname' neexistuje")
            }

            users.distinctBy { it.id }.forEach { u ->
                sharePermissionRepository.save(
                    SharePermission(shareLink = saved, user = u)
                )
            }
        }

        return ShareCreatedResponse(
            id = saved.id!!,
            code = saved.code,
            accessType = saved.accessType,
            expiresAt = saved.expiresAt
        )
    }

    @Transactional(readOnly = true)
    fun listSharesForFile(currentUsername: String, fileId: Long): List<ShareListItemDto> {
        // jen share linky souboru, které vytvořil aktuální uživatel (vlastník souboru)
        val shares = shareLinkRepository.findAllByFileIdAndCreatedByUsernameOrderByCreatedAtDesc(fileId, currentUsername)

        return shares.map { s ->
            ShareListItemDto(
                id = s.id!!,
                code = s.code,
                accessType = s.accessType,
                expiresAt = s.expiresAt,
                createdAt = s.createdAt,
                fileId = s.file.id!!,
                fileName = s.file.originalName
            )
        }
    }

    @Transactional(readOnly = true)
    fun listMyShares(currentUsername: String): List<ShareListItemDto> {
        val shares = shareLinkRepository.findAllByCreatedByUsernameOrderByCreatedAtDesc(currentUsername)
        return shares.map { s ->
            ShareListItemDto(
                id = s.id!!,
                code = s.code,
                accessType = s.accessType,
                expiresAt = s.expiresAt,
                createdAt = s.createdAt,
                fileId = s.file.id!!,
                fileName = s.file.originalName
            )
        }
    }

    @Transactional
    fun deleteShare(currentUsername: String, shareId: Long) {
        val share = shareLinkRepository.findById(shareId)
            .orElseThrow { IllegalArgumentException("Share nenalezen") }

        // mazat může jen ten, kdo ho vytvořil (typicky vlastník souboru)
        if (share.createdBy.username != currentUsername) {
            throw IllegalArgumentException("Nemáš oprávnění smazat tento share")
        }

        downloadLogRepository.deleteAllByShareLinkId(shareId)
        sharePermissionRepository.deleteAllByShareLinkId(shareId)
        shareLinkRepository.delete(share)
    }

    @Transactional(readOnly = true)
    fun getPublicInfo(code: String): PublicShareInfoResponse {
        val share = shareLinkRepository.findByCode(code)
            ?: throw IllegalArgumentException("Share nenalezen")

        if (share.accessType != AccessType.PUBLIC) {
            throw IllegalArgumentException("Tento share není veřejný")
        }
        if (share.isExpired()) {
            throw IllegalArgumentException("Share expiroval")
        }

        val f = share.file
        return PublicShareInfoResponse(
            code = share.code,
            fileId = f.id!!,
            originalName = f.originalName,
            contentType = f.contentType,
            size = f.size,
            createdAt = f.createdAt,
            expiresAt = share.expiresAt
        )
    }

    @Transactional
    fun publicDownload(code: String, ip: String?, userAgent: String?): PublicDownload {
        val share = shareLinkRepository.findByCode(code)
            ?: throw IllegalArgumentException("Share nenalezen")

        if (share.accessType != AccessType.PUBLIC) {
            throw IllegalArgumentException("Tento share není veřejný")
        }
        if (share.isExpired()) {
            throw IllegalArgumentException("Share expiroval")
        }

        val file = share.file

        downloadLogRepository.save(
            DownloadLog(
                file = file,
                shareLink = share,
                downloadedBy = null,
                ip = ip,
                userAgent = userAgent
            )
        )

        return PublicDownload(
            filename = file.originalName,
            contentType = file.contentType,
            bytes = file.data
        )
    }

    @Transactional(readOnly = true)
    fun getInfoForUser(code: String, currentUsername: String): PublicShareInfoResponse {
        val share = shareLinkRepository.findByCode(code)
            ?: throw IllegalArgumentException("Share nenalezen")

        if (share.isExpired()) throw IllegalArgumentException("Share expiroval")

        // povol ownerovi souboru vždy
        val file = share.file
        if (file.owner.username != currentUsername) {
            when (share.accessType) {
                AccessType.PUBLIC -> { /* ok */ }
                AccessType.USER_ONLY -> {
                    val allowed = share.allowedUser?.username
                    if (allowed != currentUsername) throw IllegalArgumentException("Nemáš přístup k tomuto share")
                }
                AccessType.LIST -> {
                    val ok = sharePermissionRepository.existsByShareLinkIdAndUserUsername(share.id!!, currentUsername)
                    if (!ok) throw IllegalArgumentException("Nemáš přístup k tomuto share")
                }
            }
        }

        return PublicShareInfoResponse(
            code = share.code,
            fileId = file.id!!,
            originalName = file.originalName,
            contentType = file.contentType,
            size = file.size,
            createdAt = file.createdAt,
            expiresAt = share.expiresAt
        )
    }

    @Transactional
    fun downloadForUser(code: String, currentUsername: String, ip: String?, userAgent: String?): PublicDownload {
        val share = shareLinkRepository.findByCode(code)
            ?: throw IllegalArgumentException("Share nenalezen")

        if (share.isExpired()) throw IllegalArgumentException("Share expiroval")

        val file = share.file

        // získej user pro log
        val user = userRepository.findByUsername(currentUsername)
            ?: throw IllegalArgumentException("Uživatel neexistuje")

        // owner vždy může
        if (file.owner.username != currentUsername) {
            when (share.accessType) {
                AccessType.PUBLIC -> { /* ok */ }
                AccessType.USER_ONLY -> {
                    val allowed = share.allowedUser?.username
                    if (allowed != currentUsername) throw IllegalArgumentException("Nemáš přístup k tomuto share")
                }
                AccessType.LIST -> {
                    val ok = sharePermissionRepository.existsByShareLinkIdAndUserUsername(share.id!!, currentUsername)
                    if (!ok) throw IllegalArgumentException("Nemáš přístup k tomuto share")
                }
            }
        }

        downloadLogRepository.save(
            DownloadLog(
                file = file,
                shareLink = share,
                downloadedBy = user,
                ip = ip,
                userAgent = userAgent
            )
        )

        return PublicDownload(
            filename = file.originalName,
            contentType = file.contentType,
            bytes = file.data
        )
    }
}