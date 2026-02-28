package com.ereblink.backend.shares

import com.ereblink.backend.users.User
import jakarta.persistence.*

@Entity
@Table(
    name = "share_permissions",
    uniqueConstraints = [UniqueConstraint(name = "uq_share_user", columnNames = ["share_link_id", "user_id"])]
)
class SharePermission(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "share_link_id")
    var shareLink: ShareLink,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    var user: User
)