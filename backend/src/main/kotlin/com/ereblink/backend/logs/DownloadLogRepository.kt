package com.ereblink.backend.logs

import org.springframework.data.jpa.repository.JpaRepository

interface DownloadLogRepository : JpaRepository<DownloadLog, Long> {
    fun deleteAllByShareLinkId(shareLinkId: Long)
    fun deleteAllByFileId(fileId: Long)
}