package com.ereblink.backend.auth

import com.ereblink.backend.auth.dto.AuthResponse
import com.ereblink.backend.auth.dto.LoginRequest
import com.ereblink.backend.auth.dto.RegisterRequest
import com.ereblink.backend.security.JwtService
import com.ereblink.backend.users.Role
import com.ereblink.backend.users.User
import com.ereblink.backend.users.UserRepository
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val authenticationManager: AuthenticationManager,
    private val userDetailsService: UserDetailsService,
    private val jwtService: JwtService
) {

    @Transactional
    fun register(req: RegisterRequest): AuthResponse {
        val username = req.username.trim()

        if (userRepository.existsByUsername(username)) {
            throw IllegalArgumentException("Username already exists")
        }

        val user = User(
            username = username,
            passwordHash = passwordEncoder.encode(req.password)!!,
            role = Role.USER,
            enabled = true
        )

        userRepository.save(user)

        val details = userDetailsService.loadUserByUsername(username)
        val token = jwtService.generateAccessToken(details)

        return AuthResponse(token, username, user.role)
    }

    fun login(req: LoginRequest): AuthResponse {
        try {
            authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken(req.username, req.password)
            )
        } catch (e: Exception) {
            throw BadCredentialsException("Invalid username or password")
        }

        val user = userRepository.findByUsername(req.username)
            ?: throw BadCredentialsException("Invalid username or password")

        val details = userDetailsService.loadUserByUsername(req.username)
        val token = jwtService.generateAccessToken(details)

        return AuthResponse(token, user.username, user.role)
    }
}