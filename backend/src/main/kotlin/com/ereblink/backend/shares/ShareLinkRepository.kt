package com.ereblink.backend.shares

import org.springframework.data.jpa.repository.JpaRepository
import java.time.Instant

interface ShareLinkRepository : JpaRepository<ShareLink, Long> {
    fun findByCodeAndDeactivatedAtIsNullAndFileDeactivatedAtIsNull(code: String): ShareLink?
    fun existsByCode(code: String): Boolean
    fun findByIdAndDeactivatedAtIsNull(id: Long): ShareLink?
    fun findAllByCreatedByUsernameAndDeactivatedAtIsNullAndFileDeactivatedAtIsNullOrderByCreatedAtDesc(username: String): List<ShareLink>
    fun findAllByExpiresAtLessThanEqualAndDeactivatedAtIsNull(expiresAt: Instant): List<ShareLink>
    fun findAllByFileIdAndDeactivatedAtIsNullOrderByCreatedAtDesc(fileId: Long): List<ShareLink>

    fun findAllByFileIdOrderByCreatedAtDesc(fileId: Long): List<ShareLink>
    fun findAllByFileIdAndCreatedByUsernameAndDeactivatedAtIsNullAndFileDeactivatedAtIsNullOrderByCreatedAtDesc(fileId: Long, username: String): List<ShareLink>
}
