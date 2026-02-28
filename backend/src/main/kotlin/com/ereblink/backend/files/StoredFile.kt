package com.ereblink.backend.files

import com.ereblink.backend.users.User
import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "stored_files")
class StoredFile(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id")
    var owner: User,

    @Column(nullable = false)
    var originalName: String,

    @Column(nullable = false)
    var contentType: String,

    @Column(nullable = false)
    var size: Long,

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(nullable = false)
    var data: ByteArray,

    @Column(nullable = false)
    var createdAt: Instant = Instant.now()
)