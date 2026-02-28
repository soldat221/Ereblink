package com.ereblink.backend.shares

import org.springframework.data.jpa.repository.JpaRepository

interface SharePermissionRepository : JpaRepository<SharePermission, Long> {
    fun existsByShareLinkIdAndUserUsername(shareLinkId: Long, username: String): Boolean
    fun deleteAllByShareLinkId(shareLinkId: Long)
}