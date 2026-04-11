package com.ereblink.backend.shares

import com.ereblink.backend.shares.dto.CreateShareRequest
import com.ereblink.backend.shares.dto.ShareCreatedResponse
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.Mock
import org.springframework.security.authentication.TestingAuthenticationToken

@ExtendWith(MockitoExtension::class)
class ShareControllerTest {

    @Mock
    lateinit var shareService: ShareService

    @Test
    fun `create delegates to service with authenticated username`() {
        val controller = ShareController(shareService)
        val auth = TestingAuthenticationToken("alice", "test-credentials")
        val req = CreateShareRequest(fileId = 15L, accessType = AccessType.PUBLIC)
        val expected = ShareCreatedResponse(
            id = 55L,
            code = "code-55",
            accessType = AccessType.PUBLIC,
            expiresAt = null
        )

        `when`(shareService.createShare("alice", req)).thenReturn(expected)

        val result = controller.create(auth, req)

        assertEquals(expected, result)
        verify(shareService).createShare("alice", req)
    }

    @Test
    fun `delete delegates to service with authenticated username`() {
        val controller = ShareController(shareService)
        val auth = TestingAuthenticationToken("alice", "test-credentials")

        controller.delete(auth, 89L)

        verify(shareService).deleteShare("alice", 89L)
    }
}
