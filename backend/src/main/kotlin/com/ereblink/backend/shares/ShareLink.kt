package com.ereblink.backend.shares

import com.ereblink.backend.files.StoredFile
import com.ereblink.backend.users.User
import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(
    name = "share_links",
    indexes = [Index(name = "idx_share_code", columnList = "code", unique = true)]
)
class ShareLink(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false, unique = true, length = 64)
    var code: String,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "file_id")
    var file: StoredFile,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by")
    var createdBy: User,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var accessType: AccessType = AccessType.PUBLIC,

    // pro USER_ONLY
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allowed_user_id")
    var allowedUser: User? = null,

    // expirace; null = bez expirace
    var expiresAt: Instant? = null,

    // soft-deaktivace po grace period; null = aktivní
    var deactivatedAt: Instant? = null,

    @Column(nullable = false)
    var createdAt: Instant = Instant.now()
) {
    fun isExpired(now: Instant = Instant.now()): Boolean =
        expiresAt?.let { now.isAfter(it) } ?: false
}
