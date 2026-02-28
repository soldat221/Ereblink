package com.ereblink.backend.files

import org.springframework.data.jpa.repository.JpaRepository

interface StoredFileRepository : JpaRepository<StoredFile, Long> {
    fun findAllByOwnerUsernameOrderByCreatedAtDesc(username: String): List<StoredFile>
}