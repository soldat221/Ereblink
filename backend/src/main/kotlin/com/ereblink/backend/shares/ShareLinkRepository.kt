package com.ereblink.backend.shares

import org.springframework.data.jpa.repository.JpaRepository

interface ShareLinkRepository : JpaRepository<ShareLink, Long> {
    fun findByCode(code: String): ShareLink?
    fun existsByCode(code: String): Boolean
    fun findAllByCreatedByUsernameOrderByCreatedAtDesc(username: String): List<ShareLink>

    fun findAllByFileIdOrderByCreatedAtDesc(fileId: Long): List<ShareLink>
    fun findAllByFileIdAndCreatedByUsernameOrderByCreatedAtDesc(fileId: Long, username: String): List<ShareLink>
}