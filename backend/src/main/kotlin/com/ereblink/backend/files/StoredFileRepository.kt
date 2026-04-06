package com.ereblink.backend.files

import org.springframework.data.jpa.repository.JpaRepository

interface StoredFileRepository : JpaRepository<StoredFile, Long> {
    fun findAllByOwnerUsernameAndDeactivatedAtIsNullOrderByCreatedAtDesc(username: String): List<StoredFile>
    fun findByIdAndDeactivatedAtIsNull(id: Long): StoredFile?
    fun findByIdAndOwnerUsernameAndDeactivatedAtIsNull(id: Long, username: String): StoredFile?
}
