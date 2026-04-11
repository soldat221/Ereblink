package com.ereblink.backend.shares

import com.ereblink.backend.files.StoredFile
import com.ereblink.backend.files.StoredFileRepository
import com.ereblink.backend.logs.DownloadLogRepository
import com.ereblink.backend.shares.dto.CreateShareRequest
import com.ereblink.backend.users.Role
import com.ereblink.backend.users.User
import com.ereblink.backend.users.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.Mock
import java.time.Instant

@ExtendWith(MockitoExtension::class)
class ShareServiceTest {

    @Mock
    lateinit var storedFileRepository: StoredFileRepository

    @Mock
    lateinit var shareLinkRepository: ShareLinkRepository

    @Mock
    lateinit var sharePermissionRepository: SharePermissionRepository

    @Mock
    lateinit var userRepository: UserRepository

    @Mock
    lateinit var downloadLogRepository: DownloadLogRepository

    private fun service() = ShareService(
        storedFileRepository,
        shareLinkRepository,
        sharePermissionRepository,
        userRepository,
        downloadLogRepository
    )

    @Suppress("UNCHECKED_CAST")
    private fun <T> anyNonNull(): T {
        any<T>()
        return null as T
    }

    @Test
    fun `createShare for LIST creates one permission per unique allowed user`() {
        val owner = User(id = 1L, username = "owner", passwordHash = "x", role = Role.USER)
        val alice = User(id = 2L, username = "alice", passwordHash = "x", role = Role.USER)
        val bob = User(id = 3L, username = "bob", passwordHash = "x", role = Role.USER)
        val file = StoredFile(
            id = 10L,
            owner = owner,
            originalName = "report.txt",
            contentType = "text/plain",
            size = 3,
            data = byteArrayOf(1, 2, 3)
        )
        val req = CreateShareRequest(
            fileId = 10L,
            accessType = AccessType.LIST,
            allowedUsernames = listOf(" alice ", "bob", "alice", "  ")
        )

        `when`(storedFileRepository.findByIdAndOwnerUsernameAndDeactivatedAtIsNull(10L, "owner")).thenReturn(file)
        `when`(userRepository.findByUsername("owner")).thenReturn(owner)
        `when`(userRepository.findByUsername("alice")).thenReturn(alice)
        `when`(userRepository.findByUsername("bob")).thenReturn(bob)
        `when`(shareLinkRepository.existsByCode(anyString())).thenReturn(false)
        `when`(shareLinkRepository.save(anyNonNull<ShareLink>())).thenAnswer { invocation ->
            invocation.getArgument<ShareLink>(0).apply { id = 99L }
        }

        val response = service().createShare("owner", req)

        assertEquals(99L, response.id)
        assertEquals(AccessType.LIST, response.accessType)

        val captor = ArgumentCaptor.forClass(SharePermission::class.java)
        verify(sharePermissionRepository, times(2)).save(captor.capture())

        val usernames = captor.allValues.map { it.user.username }.toSet()
        assertEquals(setOf("alice", "bob"), usernames)
    }

    @Test
    fun `getInfoForUser denies LIST share when user has no permission`() {
        val owner = User(id = 1L, username = "owner", passwordHash = "x", role = Role.USER)
        val file = StoredFile(
            id = 10L,
            owner = owner,
            originalName = "report.txt",
            contentType = "text/plain",
            size = 3,
            data = byteArrayOf(1, 2, 3),
            createdAt = Instant.now()
        )
        val share = ShareLink(
            id = 50L,
            code = "code-1",
            file = file,
            createdBy = owner,
            accessType = AccessType.LIST
        )

        `when`(shareLinkRepository.findByCodeAndDeactivatedAtIsNullAndFileDeactivatedAtIsNull("code-1"))
            .thenReturn(share)
        `when`(sharePermissionRepository.existsByShareLinkIdAndUserUsername(50L, "intruder"))
            .thenReturn(false)

        val ex = assertThrows(IllegalArgumentException::class.java) {
            service().getInfoForUser("code-1", "intruder")
        }

        assertEquals("Nemáš přístup k tomuto share", ex.message)
        verify(sharePermissionRepository).existsByShareLinkIdAndUserUsername(50L, "intruder")
    }
}
