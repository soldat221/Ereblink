package com.ereblink.backend.security

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.util.*
import kotlin.time.Duration.Companion.minutes

@Service
class JwtService(
    @Value("\${app.jwt.secret}") secret: String,
    @Value("\${app.jwt.issuer}") private val issuer: String,
    @Value("\${app.jwt.accessTokenMinutes}") private val accessTokenMinutes: Long
) {
    private val key = Keys.hmacShaKeyFor(secret.toByteArray(StandardCharsets.UTF_8))

    fun generateAccessToken(user: UserDetails): String {
        val now = Date()
        val exp = Date(now.time + accessTokenMinutes.minutes.inWholeMilliseconds)

        return Jwts.builder()
            .issuer(issuer)
            .subject(user.username)
            .issuedAt(now)
            .expiration(exp)
            .signWith(key)
            .compact()
    }

    fun extractUsername(token: String): String =
        Jwts.parser().verifyWith(key).build()
            .parseSignedClaims(token).payload.subject

    fun isValid(token: String, user: UserDetails): Boolean =
        extractUsername(token) == user.username
}