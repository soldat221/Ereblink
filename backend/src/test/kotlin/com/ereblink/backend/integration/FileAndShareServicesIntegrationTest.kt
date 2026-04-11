package com.ereblink.backend.integration

import com.ereblink.backend.files.FileService
import com.ereblink.backend.files.StoredFileRepository
import com.ereblink.backend.shares.AccessType
import com.ereblink.backend.shares.ShareLinkRepository
import com.ereblink.backend.shares.ShareService
import com.ereblink.backend.shares.dto.CreateShareRequest
import com.ereblink.backend.users.Role
import com.ereblink.backend.users.User
import com.ereblink.backend.users.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class FileAndShareServicesIntegrationTest {

    @Autowired
    lateinit var fileService: FileService

    @Autowired
    lateinit var shareService: ShareService

    @Autowired
    lateinit var userRepository: UserRepository

    @Autowired
    lateinit var storedFileRepository: StoredFileRepository

    @Autowired
    lateinit var shareLinkRepository: ShareLinkRepository

    @Test
    fun `deleteMine in FileService deactivates shares created by ShareService`() {
        val owner = userRepository.save(
            User(
                username = "owner",
                passwordHash = "hash",
                role = Role.USER,
                enabled = true
            )
        )

        val multipart = MockMultipartFile(
            "file",
            "integration-report.txt",
            "text/plain",
            "integration-body".toByteArray()
        )
        val fileId = fileService.upload(owner.username, multipart)

        val created = shareService.createShare(
            owner.username,
            CreateShareRequest(
                fileId = fileId,
                accessType = AccessType.PUBLIC
            )
        )
        val infoBeforeDelete = shareService.getPublicInfo(created.code)
        assertEquals(fileId, infoBeforeDelete.fileId)

        fileService.deleteMine(owner.username, fileId)

        val storedFile = storedFileRepository.findById(fileId).orElseThrow()
        assertNotNull(storedFile.deactivatedAt)

        val share = shareLinkRepository.findAllByFileIdOrderByCreatedAtDesc(fileId).single()
        assertNotNull(share.deactivatedAt)

        val ex = assertThrows(IllegalArgumentException::class.java) {
            shareService.getPublicInfo(created.code)
        }
        assertEquals("Share nenalezen", ex.message)
    }
}
