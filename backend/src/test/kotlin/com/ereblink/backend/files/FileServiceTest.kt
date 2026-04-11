package com.ereblink.backend.files

import com.ereblink.backend.shares.AccessType
import com.ereblink.backend.shares.ShareLink
import com.ereblink.backend.shares.ShareLinkRepository
import com.ereblink.backend.users.Role
import com.ereblink.backend.users.User
import com.ereblink.backend.users.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.Mock

@ExtendWith(MockitoExtension::class)
class FileServiceTest {

    @Mock
    lateinit var storedFileRepository: StoredFileRepository

    @Mock
    lateinit var userRepository: UserRepository

    @Mock
    lateinit var shareLinkRepository: ShareLinkRepository

    private fun service() = FileService(storedFileRepository, userRepository, shareLinkRepository)

    @Test
    fun `deleteMine deactivates file and all active shares using same timestamp`() {
        val owner = User(id = 1L, username = "owner", passwordHash = "x", role = Role.USER)
        val file = StoredFile(
            id = 7L,
            owner = owner,
            originalName = "report.pdf",
            contentType = "application/pdf",
            size = 5,
            data = byteArrayOf(1, 2, 3, 4, 5)
        )

        val share1 = ShareLink(
            id = 101L,
            code = "code-1",
            file = file,
            createdBy = owner,
            accessType = AccessType.PUBLIC
        )
        val share2 = ShareLink(
            id = 102L,
            code = "code-2",
            file = file,
            createdBy = owner,
            accessType = AccessType.PUBLIC
        )

        `when`(storedFileRepository.findByIdAndOwnerUsernameAndDeactivatedAtIsNull(7L, "owner")).thenReturn(file)
        `when`(shareLinkRepository.findAllByFileIdAndDeactivatedAtIsNullOrderByCreatedAtDesc(7L))
            .thenReturn(listOf(share1, share2))

        service().deleteMine("owner", 7L)

        assertNotNull(file.deactivatedAt)
        assertEquals(file.deactivatedAt, share1.deactivatedAt)
        assertEquals(file.deactivatedAt, share2.deactivatedAt)
    }
}
