package com.ereblink.backend.files

import com.ereblink.backend.shares.ShareService
import org.junit.jupiter.api.Assertions.assertArrayEquals
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.Mock
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.security.authentication.TestingAuthenticationToken
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@ExtendWith(MockitoExtension::class)
class FileControllerTest {

    @Mock
    lateinit var fileService: FileService

    @Mock
    lateinit var shareService: ShareService

    @Test
    fun `downloadMine returns encoded content disposition and file bytes`() {
        val controller = FileController(fileService, shareService)
        val auth = TestingAuthenticationToken("john", "test-credentials")
        val download = FileDownload(
            filename = "Můj soubor 1.txt",
            contentType = "text/plain",
            bytes = "hello".toByteArray()
        )

        `when`(fileService.downloadMine("john", 42L)).thenReturn(download)

        val response = controller.downloadMine(auth, 42L)
        val expectedName = URLEncoder.encode(download.filename, StandardCharsets.UTF_8).replace("+", "%20")

        assertEquals("attachment; filename*=UTF-8''$expectedName", response.headers.getFirst(HttpHeaders.CONTENT_DISPOSITION))
        assertEquals(MediaType.TEXT_PLAIN, response.headers.contentType)
        assertArrayEquals(download.bytes, response.body)
        verify(fileService).downloadMine("john", 42L)
    }
}
