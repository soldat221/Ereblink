package com.ereblink.backend.logs

import com.ereblink.backend.files.StoredFile
import com.ereblink.backend.shares.ShareLink
import com.ereblink.backend.users.User
import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "download_logs")
class DownloadLog(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "file_id")
    var file: StoredFile,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "share_link_id")
    var shareLink: ShareLink? = null,

    // u veřejného stažení null
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "downloaded_by")
    var downloadedBy: User? = null,

    @Column(nullable = false)
    var downloadedAt: Instant = Instant.now(),

    var ip: String? = null,

    var userAgent: String? = null
)